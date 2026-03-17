// Simple Hello World program
export function sayHello(name: string): string {
    return `Hello, ${name}!`;
}

export const greeting = sayHello("World");
console.log(greeting);
