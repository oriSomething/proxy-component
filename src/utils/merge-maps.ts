export default function mergeMaps<T, K>(...maps: Map<T, K>[]): Map<T, K> {
  const output = maps.shift();

  if (output == null) {
    return new Map<T, K>();
  }

  for (let map of maps) {
    for (let [key, value] of map) {
      output.set(key, value);
    }
  }

  return output;
}
