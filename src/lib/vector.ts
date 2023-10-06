export async function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length) {
    throw new Error(`Cannot compute cosine similarity between vectors of different lengths: ${a.length} and ${b.length}`);
  }

  const dotProduct = a.reduce((runningDotProduct, a_i, i) => runningDotProduct + a_i * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((runningMagnitude, a_i) => runningMagnitude + a_i ** 2, 0));
  const magnitudeB = Math.sqrt(b.reduce((runningMagnitude, a_i) => runningMagnitude + a_i ** 2, 0));

  return dotProduct / (magnitudeA * magnitudeB);
}

