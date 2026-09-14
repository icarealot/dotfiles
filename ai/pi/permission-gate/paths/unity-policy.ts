// Detects Unity projects and evaluates their protected paths; add Unity-specific rules and data here.

import { dirname, extname, join, relative, resolve } from "node:path";
import { isDirectory, isFile, isInsideRoot, normalizedToolPath } from "./path-utils.js";

const UNITY_ROOT_DIRECTORIES = new Set([
  ".gradle",
  ".utmp",
  ".vs",
  "build",
  "builds",
  "exportedobj",
  "library",
  "logs",
  "memorycaptures",
  "obj",
  "recordings",
  "screenshots",
  "temp",
  "usersettings",
]);

const UNITY_ROOT_FILES = new Set(["crashlytics-build.properties", "sysinfo.txt"]);
const UNITY_ROOT_PROJECT_EXTENSIONS = new Set([".csproj", ".sln", ".slnx"]);
const UNITY_BINARY_EXTENSIONS = new Set([
  ".3dm",
  ".3ds",
  ".7z",
  ".a",
  ".aab",
  ".aif",
  ".aiff",
  ".apk",
  ".app",
  ".asf",
  ".avi",
  ".blend",
  ".blend1",
  ".bmp",
  ".bz2",
  ".c4d",
  ".collada",
  ".cubemap",
  ".dae",
  ".dll",
  ".dxf",
  ".exe",
  ".exr",
  ".fbx",
  ".flv",
  ".gif",
  ".gz",
  ".hdr",
  ".iff",
  ".it",
  ".jas",
  ".jpeg",
  ".jpg",
  ".lws",
  ".lxo",
  ".ma",
  ".max",
  ".mb",
  ".mod",
  ".mov",
  ".mp3",
  ".mp4",
  ".mpeg",
  ".mpg",
  ".obj",
  ".ogg",
  ".ogv",
  ".otf",
  ".pdb",
  ".pdf",
  ".pict",
  ".ply",
  ".png",
  ".psd",
  ".rar",
  ".reason",
  ".rns",
  ".s3m",
  ".skp",
  ".so",
  ".stl",
  ".tar",
  ".tga",
  ".tif",
  ".tiff",
  ".ttf",
  ".unitypackage",
  ".wav",
  ".webp",
  ".wmv",
  ".xm",
  ".zip",
  ".ztl",
]);

type UnityPath = {
  segments: string[];
  fileName: string;
};

type UnityPathRule = (path: UnityPath) => boolean;

function isUnityProjectRoot(path: string): boolean {
  return (
    isDirectory(join(path, "Assets")) &&
    isDirectory(join(path, "Packages")) &&
    isFile(join(path, "ProjectSettings", "ProjectVersion.txt"))
  );
}

function findUnityProjectRoot(cwd: string): string | undefined {
  let candidate = resolve(cwd);

  while (true) {
    if (isUnityProjectRoot(candidate)) {
      return candidate;
    }

    const parent = dirname(candidate);
    if (parent === candidate) {
      return undefined;
    }
    candidate = parent;
  }
}

function isGeneratedRootDirectory({ segments }: UnityPath): boolean {
  return UNITY_ROOT_DIRECTORIES.has(segments[0]);
}

function isGeneratedRootFile({ segments, fileName }: UnityPath): boolean {
  return (
    segments.length === 1 &&
    (UNITY_ROOT_FILES.has(fileName) || UNITY_ROOT_PROJECT_EXTENSIONS.has(extname(fileName)))
  );
}

function isUnityMetadata({ fileName }: UnityPath): boolean {
  return fileName.endsWith(".meta");
}

function isUnityLockOrVersionFile({ segments, fileName }: UnityPath): boolean {
  return (
    segments.length === 2 &&
    ((segments[0] === "packages" && fileName === "packages-lock.json") ||
      (segments[0] === "projectsettings" && fileName === "projectversion.txt"))
  );
}

function isManagedSpecialAsset({ fileName }: UnityPath): boolean {
  return fileName === "lightingdata.asset" || fileName.endsWith(".skel.bytes");
}

function isBinaryAsset({ fileName }: UnityPath): boolean {
  return UNITY_BINARY_EXTENSIONS.has(extname(fileName));
}

function isAddressablesBinary({ segments, fileName }: UnityPath): boolean {
  return (
    segments.length === 4 &&
    segments[0] === "assets" &&
    segments[1] === "addressableassetsdata" &&
    fileName.includes(".bin")
  );
}

function isStreamingAddressablesOutput({ segments }: UnityPath): boolean {
  return (
    segments.length >= 3 &&
    segments[0] === "assets" &&
    segments[1] === "streamingassets" &&
    segments[2] === "aa"
  );
}

function isJetBrainsEditorPlugin({ segments }: UnityPath): boolean {
  return (
    segments.length >= 4 &&
    segments[0] === "assets" &&
    segments[1] === "plugins" &&
    segments[2] === "editor" &&
    segments[3].startsWith("jetbrains")
  );
}

const UNITY_PATH_RULES: UnityPathRule[] = [
  isGeneratedRootDirectory,
  isGeneratedRootFile,
  isUnityMetadata,
  isUnityLockOrVersionFile,
  isManagedSpecialAsset,
  isBinaryAsset,
  isAddressablesBinary,
  isStreamingAddressablesOutput,
  isJetBrainsEditorPlugin,
];

export function isUnityProtectedPath(path: string, cwd: string): boolean {
  const unityRoot = findUnityProjectRoot(cwd);
  if (!unityRoot) {
    return false;
  }

  const absolutePath = resolve(cwd, normalizedToolPath(path));
  if (!isInsideRoot(unityRoot, absolutePath)) {
    return false;
  }

  const relativePath = relative(unityRoot, absolutePath).replace(/\\/g, "/");
  const segments = relativePath
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.toLowerCase());

  if (segments.length === 0) {
    return false;
  }

  const unityPath = { segments, fileName: segments.at(-1) ?? "" };
  return UNITY_PATH_RULES.some((rule) => rule(unityPath));
}
