// Parses shell command segments and detects structured Git invocations; extend wrapper handling here.

import {
  BLOCKED_GIT_SUBCOMMANDS,
  ENV_OPTIONS_WITH_ARGUMENTS,
  GIT_OPTIONS_WITH_ARGUMENTS,
  SUDO_OPTIONS_WITH_ARGUMENTS,
} from "./policy.js";

const COMMAND_SEPARATORS = new Set([";", "|", "&", "(", ")", "{", "}", "\n"]);
const SHELL_PREFIXES = new Set(["!", "if", "elif", "while", "until", "then", "do", "time"]);

function tokenizeShell(command: string): string[][] {
  const commands: string[][] = [];
  let words: string[] = [];
  let word = "";
  let index = 0;

  const finishWord = (): void => {
    if (word !== "") {
      words.push(word);
      word = "";
    }
  };

  const finishCommand = (): void => {
    finishWord();
    if (words.length > 0) {
      commands.push(words);
      words = [];
    }
  };

  while (index < command.length) {
    const character = command[index];

    if (character === " " || character === "\t" || character === "\r") {
      finishWord();
      index += 1;
      continue;
    }

    if (character === "#" && word === "") {
      while (index < command.length && command[index] !== "\n") {
        index += 1;
      }
      continue;
    }

    if (COMMAND_SEPARATORS.has(character)) {
      finishCommand();
      index += command[index + 1] === character && (character === "|" || character === "&") ? 2 : 1;
      continue;
    }

    if (character === "'") {
      index += 1;
      while (index < command.length && command[index] !== "'") {
        word += command[index];
        index += 1;
      }
      index += Number(command[index] === "'");
      continue;
    }

    if (character === '"') {
      index += 1;
      while (index < command.length && command[index] !== '"') {
        if (command[index] === "\\" && /[$`"\\\n]/.test(command[index + 1] ?? "")) {
          index += 1;
        }
        word += command[index] ?? "";
        index += 1;
      }
      index += Number(command[index] === '"');
      continue;
    }

    if (character === "\\" && index + 1 < command.length) {
      word += command[index + 1];
      index += 2;
      continue;
    }

    word += character;
    index += 1;
  }

  finishCommand();
  return commands;
}

function executableName(word: string): string {
  return word.replace(/\\/g, "/").split("/").at(-1)?.toLowerCase() ?? "";
}

function isAssignment(word: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*=/.test(word);
}

function skipOptionArguments(words: string[], start: number, optionsWithArguments: Set<string>): number {
  let index = start;

  while (index < words.length && words[index].startsWith("-")) {
    const option = words[index];
    index += 1;
    if (optionsWithArguments.has(option)) {
      index += 1;
    }
  }

  return index;
}

function gitSubcommandIsBlocked(words: string[], gitIndex: number): boolean {
  let index = gitIndex + 1;

  while (index < words.length) {
    const word = words[index];
    if (!word.startsWith("-") || word === "-") {
      return BLOCKED_GIT_SUBCOMMANDS.has(word);
    }

    index += 1;
    if (GIT_OPTIONS_WITH_ARGUMENTS.has(word)) {
      index += 1;
    }
  }

  return false;
}

function commandInvokesBlockedGit(words: string[]): boolean {
  let index = 0;

  while (SHELL_PREFIXES.has(words[index])) {
    index += 1;
  }
  while (isAssignment(words[index] ?? "")) {
    index += 1;
  }

  while (index < words.length) {
    const executable = executableName(words[index]);

    if (executable === "git" || executable === "git.exe") {
      return gitSubcommandIsBlocked(words, index);
    }

    if (executable === "command") {
      index += 1;
      if (words[index] === "-v" || words[index] === "-V") {
        return false;
      }
      while (words[index] === "-p" || words[index] === "--") {
        index += 1;
      }
      continue;
    }

    if (executable === "env" || executable === "env.exe") {
      index = skipOptionArguments(words, index + 1, ENV_OPTIONS_WITH_ARGUMENTS);
      while (isAssignment(words[index] ?? "")) {
        index += 1;
      }
      continue;
    }

    if (executable === "sudo" || executable === "sudo.exe") {
      index = skipOptionArguments(words, index + 1, SUDO_OPTIONS_WITH_ARGUMENTS);
      while (isAssignment(words[index] ?? "")) {
        index += 1;
      }
      continue;
    }

    return false;
  }

  return false;
}

export function invokesBlockedGitCommand(command: string): boolean {
  return tokenizeShell(command).some(commandInvokesBlockedGit);
}
