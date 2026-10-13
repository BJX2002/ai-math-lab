/**
 * Node ESM resolve hook for the content tests.
 *
 * Application code uses extensionless relative imports (`./types`), which is
 * correct for the bundler and for `moduleResolution: "bundler"`, but Node's ESM
 * resolver requires a file extension. Rather than bend the application style to
 * suit the tests, this hook retries a failed relative specifier with the
 * extensions the project actually uses.
 */
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND" || !specifier.startsWith(".")) throw error;

    for (const candidate of [`${specifier}.ts`, `${specifier}.tsx`, `${specifier}/index.ts`]) {
      try {
        return await nextResolve(candidate, context);
      } catch {
        // Try the next candidate extension.
      }
    }
    throw error;
  }
}
