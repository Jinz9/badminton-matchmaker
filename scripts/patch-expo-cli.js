const fs = require('fs');
const path = require('path');

function patchManifestMiddleware() {
  const filePath = path.join(__dirname, '..', 'node_modules', '@expo', 'cli', 'build', 'src', 'start', 'server', 'middleware', 'ManifestMiddleware.js');
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Patch _getBundleUrl to ensure valid http/https scheme
  const oldGetBundleUrl = `return this.options.constructUrl({
            scheme: protocol ?? "http",
            // hostType: this.options.location.hostType,
            hostname
        }) + path;`;

  const newGetBundleUrl = `let safeScheme = protocol ?? "http";
        if (safeScheme === "exp" || safeScheme === "exps") safeScheme = safeScheme === "exps" ? "https" : "http";
        if (!safeScheme) safeScheme = "http";
        let hostUrl = this.options.constructUrl({
            scheme: safeScheme,
            hostname
        });
        if (!/^https?:\\/\\//.test(hostUrl)) {
            hostUrl = (safeScheme === "https" ? "https://" : "http://") + hostUrl.replace(/^[^:]+:\\/\\//, "");
        }
        return hostUrl + path;`;

  if (content.includes(oldGetBundleUrl)) {
    content = content.replace(oldGetBundleUrl, newGetBundleUrl);
  }

  // Patch mutateManifestWithAssetsAsync to safely resolve asset URLs without throwing null[0]
  const oldMutate = `async mutateManifestWithAssetsAsync(manifest, bundleUrl) {`;
  const mutateIdx = content.indexOf(oldMutate);
  if (mutateIdx !== -1) {
    const endIdx = content.indexOf('getWebBundleUrl()', mutateIdx);
    if (endIdx !== -1) {
      const fixedMutate = `async mutateManifestWithAssetsAsync(manifest, bundleUrl) {
        const urlMatch = bundleUrl ? bundleUrl.match(/^https?:\\/\\/[^\\/]+\\//) : null;
        const baseUrl = urlMatch ? urlMatch[0] : (bundleUrl ? "http://" + bundleUrl.replace(/^[^:]+:\\/\\//, "").split("/")[0] + "/" : "http://localhost:8081/");
        await (0, _resolveAssets.resolveManifestAssets)(this.projectRoot, {
            manifest,
            resolver: async (path)=>{
                if (this.options.isNativeWebpack) {
                    return (0, _url().resolve)(baseUrl, path);
                }
                return baseUrl + "assets/" + path;
            }
        });
        await (0, _resolveAssets.resolveGoogleServicesFile)(this.projectRoot, manifest);
    }\n    `;
      content = content.slice(0, mutateIdx) + fixedMutate + content.slice(endIdx);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('ManifestMiddleware.js patched successfully.');
}

function patchExpoGoManifestHandlerMiddleware() {
  const filePath = path.join(__dirname, '..', 'node_modules', '@expo', 'cli', 'build', 'src', 'start', 'server', 'middleware', 'ExpoGoManifestHandlerMiddleware.js');
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Ensure launchAsset.url uses http/https
  const oldLaunch = `launchAsset: {
                key: "bundle",
                contentType: "application/javascript",
                url: bundleUrl
            },`;

  const newLaunch = `launchAsset: {
                key: "bundle",
                contentType: "application/javascript",
                url: (bundleUrl || "").replace(/^exp:\\/\\//, "http://").replace(/^exps:\\/\\//, "https://")
            },`;

  if (content.includes(oldLaunch)) {
    content = content.replace(oldLaunch, newLaunch);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('ExpoGoManifestHandlerMiddleware.js patched successfully.');
  }
}

patchManifestMiddleware();
patchExpoGoManifestHandlerMiddleware();
