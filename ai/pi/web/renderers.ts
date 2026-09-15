import { keyHint, type Theme } from "@earendil-works/pi-coding-agent";
import type { Component } from "@earendil-works/pi-tui";
import { Text } from "@earendil-works/pi-tui";

interface ToolResultContent {
    type: string;
    text?: string;
}

interface ToolResult {
    content: ToolResultContent[];
}

function getResultText(result: ToolResult): string {
    const textParts: string[] = [];

    for (const item of result.content) {
        if (item.type === "text" && item.text) {
            textParts.push(item.text);
        }
    }

    return textParts.join("\n");
}

export function renderCollapsedResult(
    result: ToolResult,
    options: { expanded: boolean },
    theme: Theme,
): Component {
    const text = getResultText(result);

    if (options.expanded) {
        return new Text(text, 0, 0);
    }

    const lineCount = text.split("\n").length;
    const lineWord = lineCount === 1 ? "line" : "lines";
    const expandHint = keyHint("app.tools.expand", "to expand");
    const summary = `(${lineCount} ${lineWord}, ${expandHint})`;

    return new Text(theme.fg("muted", summary), 0, 0);
}

function getCallDisplay(args: unknown): string {
    if (typeof args !== "object" || args === null) {
        return "";
    }

    if ("query" in args && typeof args.query === "string" && args.query) {
        return `"${args.query}"`;
    }

    if ("urls" in args && Array.isArray(args.urls)) {
        return `\n${args.urls.join("\n")}`;
    }

    return "";
}

export function createCallRenderer(
    toolName: string,
): (args: unknown, theme: Theme) => Component {
    return (args, theme) => {
        const display = getCallDisplay(args);
        const title = theme.fg("toolTitle", theme.bold(`${toolName} `));

        return new Text(title + theme.fg("muted", display), 0, 0);
    };
}
