
export const clearScreen = () => {
    // console.clear() works in most modern terminals (Windows Terminal, VS Code, etc.)
    console.clear();
};

export const printHeader = (text: string) => {
    console.log(`\n===== ${text} =====`);
};

export const waitForKey = async (
    askQuestion: (q: string) => Promise<string>,
    message: string = "Press Enter to return to menu..."
) => {
    await askQuestion(`\n${message}`);
};
