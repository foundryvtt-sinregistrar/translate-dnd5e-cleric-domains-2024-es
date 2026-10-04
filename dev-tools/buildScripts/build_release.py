#!/usr/bin/env python3
"""Build and validate a Foundry module release from a committed Git revision."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path


REQUIRED_ROOT_FILES = {"module.json", "README.md", "README.en.md", "CHANGELOG.md", "LICENSE.md"}
ALLOWED_ROOT_FILES = REQUIRED_ROOT_FILES | {"DEVELOPER.md"}
PAYLOAD_DIRECTORIES = {"compendium", "lang", "scripts"}
SAFE_ID = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*$")
SAFE_VERSION = re.compile(r"[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$")


def git(root: Path, *arguments: str) -> bytes:
    return subprocess.run(
        ["git", *arguments], cwd=root, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
    ).stdout


def resolve_commit(root: Path, reference: str) -> str:
    return git(root, "rev-parse", "--verify", "--end-of-options", f"{reference}^{{commit}}").decode().strip()


def load_manifest(root: Path, commit: str) -> tuple[bytes, dict]:
    raw = git(root, "show", f"{commit}:module.json")
    manifest = json.loads(raw)
    if not isinstance(manifest, dict):
        raise ValueError("module.json must contain an object")
    if not isinstance(manifest.get("id"), str) or not SAFE_ID.fullmatch(manifest["id"]):
        raise ValueError("module.json has an invalid id")
    if not isinstance(manifest.get("version"), str) or not SAFE_VERSION.fullmatch(manifest["version"]):
        raise ValueError("module.json has an invalid version")
    return raw, manifest


def verify_publication(root: Path, commit: str, manifest: dict, release_tag: str | None) -> None:
    repository = manifest.get("url")
    if not isinstance(repository, str) or not re.fullmatch(
        r"https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository
    ):
        raise ValueError("module.json url must be a GitHub repository URL")
    expected_manifest = f"{repository}/releases/latest/download/module.json"
    expected_download = f"{repository}/releases/download/v{manifest['version']}/{manifest['id']}.zip"
    if manifest.get("manifest") != expected_manifest:
        raise ValueError("module.json manifest URL does not use the latest release asset")
    if manifest.get("download") != expected_download:
        raise ValueError("module.json download URL does not match its version")
    if release_tag:
        tag = release_tag.removeprefix("refs/tags/")
        if tag != f"v{manifest['version']}":
            raise ValueError("release tag does not match module.json version")
        if resolve_commit(root, f"refs/tags/{tag}") != commit:
            raise ValueError("release tag does not identify the selected commit")
        changelog = git(root, "show", f"{commit}:CHANGELOG.md").decode("utf-8")
        if not re.search(r"^## \[" + re.escape(manifest["version"]) + r"\](?:\s|$)", changelog, re.MULTILINE):
            raise ValueError("release version is absent from CHANGELOG.md")


def distributable_files(root: Path, commit: str) -> list[str]:
    tracked = git(root, "ls-tree", "-r", "--name-only", commit).decode().splitlines()
    selected = [
        path for path in tracked
        if path in ALLOWED_ROOT_FILES or path.split("/", 1)[0] in PAYLOAD_DIRECTORIES
    ]
    missing = REQUIRED_ROOT_FILES - set(selected)
    if missing:
        raise ValueError("missing required release files: " + ", ".join(sorted(missing)))
    return selected


def validate_zip(path: Path, raw_manifest: bytes, manifest: dict) -> None:
    prefix = f"{manifest['id']}/"
    with zipfile.ZipFile(path) as archive:
        if archive.testzip() is not None:
            raise ValueError("ZIP checksum validation failed")
        names = {entry.filename for entry in archive.infolist() if not entry.is_dir()}
        if any(not name.startswith(prefix) for name in names):
            raise ValueError("ZIP contains an invalid root prefix")
        archived_manifest = archive.read(prefix + "module.json")
        if archived_manifest.replace(b"\r\n", b"\n") != raw_manifest.replace(b"\r\n", b"\n"):
            raise ValueError("archived module.json differs from the selected commit")
        for path in [*manifest.get("esmodules", []), *(entry["path"] for entry in manifest.get("languages", []))]:
            if prefix + path not in names:
                raise ValueError(f"manifest entry is absent from ZIP: {path}")
        for name in names:
            if name.endswith(".json"):
                json.loads(archive.read(name))


def build(arguments: argparse.Namespace) -> tuple[str, list[Path]]:
    root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel").decode().strip())
    if not arguments.allow_dirty and git(root, "status", "--porcelain").strip():
        raise ValueError("working tree is not clean; commit changes or use --allow-dirty")
    commit = resolve_commit(root, arguments.ref)
    raw_manifest, manifest = load_manifest(root, commit)
    verify_publication(root, commit, manifest, arguments.release_tag)
    files = distributable_files(root, commit)
    output = (root / arguments.dist).resolve()
    output.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix=".build-", dir=output) as temporary:
        stage = Path(temporary)
        versioned = stage / f"{manifest['id']}-{manifest['version']}.zip"
        subprocess.run(
            ["git", "archive", "--format=zip", f"--prefix={manifest['id']}/", "-o", str(versioned), commit, "--", *files],
            cwd=root,
            check=True,
        )
        validate_zip(versioned, raw_manifest, manifest)
        alias = stage / f"{manifest['id']}.zip"
        shutil.copyfile(versioned, alias)
        external_manifest = stage / "module.json"
        external_manifest.write_bytes(raw_manifest)
        artifacts = [versioned, alias, external_manifest]
        checksums = stage / "SHA256SUMS.txt"
        checksums.write_text(
            "".join(f"{hashlib.sha256(item.read_bytes()).hexdigest()}  {item.name}\n" for item in artifacts),
            encoding="ascii",
        )
        artifacts.append(checksums)
        results = []
        for artifact in artifacts:
            destination = output / artifact.name
            artifact.replace(destination)
            results.append(destination)
    return commit, results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dist", default="dist")
    parser.add_argument("--ref", default="HEAD")
    parser.add_argument("--release-tag")
    parser.add_argument("--allow-dirty", action="store_true")
    arguments = parser.parse_args()
    try:
        commit, artifacts = build(arguments)
        print(f"Commit: {commit}")
        for artifact in artifacts:
            print(f"OK: {artifact} ({artifact.stat().st_size} bytes)")
        return 0
    except subprocess.CalledProcessError as error:
        print(f"ERROR (git): {error.stderr.decode('utf-8', errors='replace').strip()}", file=sys.stderr)
    except (KeyError, OSError, TypeError, ValueError, zipfile.BadZipFile) as error:
        print(f"ERROR: {error}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
