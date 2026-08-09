export const safeBtoa = (str) => {
    try {
        const bytes = new TextEncoder().encode(str);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    } catch (e) {
        return btoa(str);
    }
};

export function sha224Hex(m) {
    const msg = new TextEncoder().encode(m);
    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
        0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
        0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
        0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
        0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
        0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
        0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    let H = [
        0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939, 0xffc00b31, 0x68581511,
        0x64f98fa7, 0xbefa4fa4,
    ];
    const words = [];
    const n = Math.ceil((msg.length + 9) / 64) * 16;
    for (let i = 0; i < n; i++) words[i] = 0;
    for (let i = 0; i < msg.length; i++)
        words[i >> 2] |= msg[i] << (24 - (i % 4) * 8);
    words[msg.length >> 2] |= 0x80 << (24 - (msg.length % 4) * 8);
    words[n - 1] = msg.length * 8;
    const W = [];
    for (let i = 0; i < n; i += 16) {
        let [a, b, c, d, e, f, g, h] = H;
        for (let j = 0; j < 64; j++) {
            if (j < 16) W[j] = words[i + j];
            else {
                let w15 = W[j - 15],
                    w2 = W[j - 2];
                let s0 =
                    ((w15 >>> 7) | (w15 << 25)) ^
                    ((w15 >>> 18) | (w15 << 14)) ^
                    (w15 >>> 3);
                let s1 =
                    ((w2 >>> 17) | (w2 << 15)) ^
                    ((w2 >>> 19) | (w2 << 13)) ^
                    (w2 >>> 10);
                W[j] = (W[j - 16] + s0 + W[j - 7] + s1) >>> 0;
            }
            let S1 =
                ((e >>> 6) | (e << 26)) ^
                ((e >>> 11) | (e << 21)) ^
                ((e >>> 25) | (e << 7));
            let ch = (e & f) ^ (~e & g);
            let temp1 = (h + S1 + ch + K[j] + W[j]) >>> 0;
            let S0 =
                ((a >>> 2) | (a << 30)) ^
                ((a >>> 13) | (a << 19)) ^
                ((a >>> 22) | (a << 10));
            let maj = (a & b) ^ (a & c) ^ (b & c);
            let temp2 = (S0 + maj) >>> 0;
            h = g;
            g = f;
            f = e;
            e = (d + temp1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) >>> 0;
        }
        H[0] = (H[0] + a) >>> 0;
        H[1] = (H[1] + b) >>> 0;
        H[2] = (H[2] + c) >>> 0;
        H[3] = (H[3] + d) >>> 0;
        H[4] = (H[4] + e) >>> 0;
        H[5] = (H[5] + f) >>> 0;
        H[6] = (H[6] + g) >>> 0;
        H[7] = (H[7] + h) >>> 0;
    }
    return H.slice(0, 7)
        .map((v) => v.toString(16).padStart(8, "0"))
        .join("");
}

export const trojanHashCache = new Map();

export function getTrojanHash(uuid) {
    if (trojanHashCache.has(uuid)) return trojanHashCache.get(uuid);
    const hash = sha224Hex(uuid);
    trojanHashCache.set(uuid, hash);
    return hash;
}

export function generateApiKey(name) {
    const id = crypto.randomUUID();
    const raw = `nahan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const key = raw;
    return {
        id,
        name: name || "Unnamed Key",
        key,
        createdAt: Date.now(),
        lastUsed: null,
    };
}

export function parseImportBindings(importStr) {
    const cleanStr = importStr.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").trim();
    const content = cleanStr
        .replace(/^import\s*/, "")
        .replace(/\s*from\s+["'].*?["'];?$/, "")
        .trim();

    const bindings = [];

    if (content.startsWith("*")) {
        const match = content.match(/\*\s+as\s+(\w+)/);
        if (match) bindings.push({ name: match[1], isNamespace: true });
        return bindings;
    }

    const braceStart = content.indexOf("{");
    if (braceStart !== -1) {
        const defaultPart = content.slice(0, braceStart).replace(/,/, "").trim();
        if (defaultPart) {
            bindings.push({ name: defaultPart, isDefault: true });
        }
        const bracePart = content.slice(braceStart + 1, content.lastIndexOf("}")).trim();
        const namedImports = bracePart.split(",").map((s) => s.trim()).filter(Boolean);
        namedImports.forEach((item) => {
            if (item.includes(" as ")) {
                const parts = item.split(/\s+as\s+/);
                bindings.push({ name: parts[1], original: parts[0] });
            } else {
                bindings.push({ name: item });
            }
        });
    } else {
        bindings.push({ name: content, isDefault: true });
    }

    return bindings;
}

export function obfuscateCode(srcText) {
    const importRegex = /import\s*\{[^}]*\}\s*from\s*["'][^"']*["'];?/g;
    const imports = [];
    let match;

    while ((match = importRegex.exec(srcText)) !== null) {
        imports.push(match[0]);
    }

    let cleanCode = srcText.replace(importRegex, "");

    const bindings = [];
    imports.forEach((imp) => {
        const parsed = parseImportBindings(imp);
        bindings.push(...parsed);
    });

    const uniqueBindings = [];
    const seenNames = new Set();
    bindings.forEach((b) => {
        if (!seenNames.has(b.name)) {
            seenNames.add(b.name);
            uniqueBindings.push(b);
        }
    });

    cleanCode = cleanCode.replace(/export\s+default\s+/g, "const _0xNahanModule = ");
    cleanCode = cleanCode.replace(/export\s*\{([^}]*?)\s+as\s+default\s*\}\s*;?/g, (m, inner) => "const _0xNahanModule = " + inner.split(/\s+as\s+/)[0].trim() + ";");
    cleanCode += "\nreturn _0xNahanModule;";

    const randKey = Math.floor(Math.random() * 80) + 64;

    const encoder = new TextEncoder();
    const bytes = encoder.encode(cleanCode);

    let hexOutput = "";
    for (let i = 0; i < bytes.length; i++) {
        const xorByte = bytes[i] ^ randKey;
        hexOutput += xorByte.toString(16).padStart(2, "0");
    }

    const rawImportsStr = imports.join("\n");
    const bindingNames = uniqueBindings.map((b) => b.name);

    const finalLoaderCode =
        rawImportsStr +
        "\n\n" +
        "// Nahan Gateway - Obfuscated Loader Context (v2.5.4.2 Optimized)\n" +
        'const _0xNahanPayload = "' +
        hexOutput +
        '";\n' +
        "const _0xNahanKey = " +
        randKey +
        ";\n\n" +
        "const _0xNahanBytes = new Uint8Array((_0xNahanPayload.match(/.{1,2}/g) || []).map(x => parseInt(x, 16) ^ _0xNahanKey));\n" +
        "const _0xNahanCode = new TextDecoder().decode(_0xNahanBytes);\n" +
        "const _0xNahanRuntime = new Function(" +
        bindingNames.map((name) => '"' + name + '"').join(", ") +
        ", _0xNahanCode)(" +
        bindingNames.join(", ") +
        ");\n\n" +
        "export default _0xNahanRuntime;";

    return finalLoaderCode;
}

export function cmpVersions(a, b) {
    const strip = (v) => String(v).replace(/^v/, "").trim();
    const pa = strip(a).split(".").map(Number);
    const pb = strip(b).split(".").map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        let na = pa[i] || 0,
            nb = pb[i] || 0;
        if (na > nb) return 1;
        if (nb > na) return -1;
    }
    return 0;
}
