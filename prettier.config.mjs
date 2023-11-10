/**
 *  @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options & import("eslint-plugin-prettier")}
 * */
const config = {
  plugins: ['prettier-plugin-tailwindcss', 'eslint-plugin-prettier'],
  singleQuote: true,
  semi: false,
}

export default config
