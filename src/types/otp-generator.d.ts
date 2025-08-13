declare module "otp-generator" {
  export interface GenerateOptions {
    digits?: boolean;
    alphabets?: boolean;
    upperCase?: boolean;
    specialChars?: boolean;
  }

  export function generate(length: number, options?: GenerateOptions): string;
}
