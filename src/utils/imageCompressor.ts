/**
 * Utility to compress images entirely in the browser using HTML5 Canvas.
 * No Firebase Storage is used. Output is saved directly as a base64 Data URL.
 */

interface CompressionOptions {
  maxDimension?: number; // 800px for posts/ads, 400px for profile/logos/covers
  initialQuality?: number; // Default 0.6
  maxSizeBytes?: number; // Default 700 KB (716,800 bytes)
}

/**
 * Compresses an image to maxDimension (800px or 400px), JPEG 0.6 quality,
 * and ensures it does not exceed 700 KB by progressively reducing size and quality.
 */
export async function compressImage(
  input: File | Blob | string,
  options: CompressionOptions = {}
): Promise<string> {
  const maxDimension = options.maxDimension || 800;
  const initialQuality = options.initialQuality || 0.6;
  const maxSizeBytes = options.maxSizeBytes || 700 * 1024; // 700 KB

  // If already a remote URL (like default asset), return directly
  if (typeof input === 'string') {
    if (!input.startsWith('data:image/') && (input.startsWith('http') || input.startsWith('/'))) {
      return input;
    }
  }

  const img = await loadImage(input);

  let currentMaxDim = maxDimension;
  let currentQuality = initialQuality;
  let bestDataUrl = '';

  for (let attempt = 0; attempt < 6; attempt++) {
    let width = img.width;
    let height = img.height;

    if (width > currentMaxDim || height > currentMaxDim) {
      if (width > height) {
        height = Math.round((height * currentMaxDim) / width);
        width = currentMaxDim;
      } else {
        width = Math.round((width * currentMaxDim) / height);
        height = currentMaxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Não foi possível processar a imagem no navegador.');
    }

    // White background in case of transparent PNG/WebP converted to JPEG
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    bestDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
    const estimatedBytes = getApproximateSizeInBytes(bestDataUrl);

    if (estimatedBytes <= maxSizeBytes) {
      return bestDataUrl;
    }

    // Reduce quality and dimension for next iteration
    currentQuality = Math.max(0.2, currentQuality - 0.1);
    currentMaxDim = Math.round(currentMaxDim * 0.85);
  }

  return bestDataUrl;
}

function getApproximateSizeInBytes(dataUrl: string): number {
  const head = 'data:image/jpeg;base64,';
  const base64 = dataUrl.startsWith(head) ? dataUrl.slice(head.length) : dataUrl;
  return Math.ceil((base64.length * 3) / 4);
}

function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Falha ao carregar a imagem.'));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          img.src = reader.result;
        } else {
          reject(new Error('Falha ao ler o ficheiro de imagem.'));
        }
      };
      reader.onerror = () => reject(new Error('Falha ao ler o ficheiro de imagem.'));
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Timeout wrapper for Firestore operations:
 * Rejects after timeoutMs (default 20 seconds) with an explicit error in Portuguese.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 20000,
  errorMessage: string = 'A gravação demorou mais de 20 segundos. Por favor, tente novamente.'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
