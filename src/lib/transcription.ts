export interface ScriptSegments {
    intro: string;
    body: string;
    outro: string;
}

/**
 * Splits the script into Intro (15%), Body (75%), and Outro (10%)
 * based on pure character length.
 */
export function splitScript(text: string): ScriptSegments {
    const trimmed = text.trim();
    const length = trimmed.length;

    if (length === 0) {
        return { intro: "", body: "", outro: "" };
    }

    // Calculate cut points
    const introEnd = Math.floor(length * 0.15);
    const outroStart = Math.floor(length * 0.90);

    const intro = trimmed.slice(0, introEnd);
    const body = trimmed.slice(introEnd, outroStart);
    const outro = trimmed.slice(outroStart);

    return { intro, body, outro };
}
