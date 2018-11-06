# RECkEN
A proof of concept recommendation engine that produces a list of top-k similar items (given an item) on demand.

## Design
Following design decisions influenced the implementation of this engine.
* A one-time batch job is ran to generate an inverted index of attributes to items<sup id='a1'>[[1]](#f1)</sup>. A streaming job updates that inverted index whenever a new item is added to the main database<sup id='a2'>[[2]](#f2)</sup>. The inverted index helps with reducing the time complexity of each recommendation request from `O(n)` to `O(m)` (where, `n` is total items, and `m` is total attributes x matching items<sup id='a3'>[[3]](#f3)</sup>).
* A probabilistic data structure (namely, Stream Summary<sup id='a4'>[[4]](#f4)</sup>) is used to aggregate the top-k items. This helps with reducing the space complexity of each recommendation request from `O(n)` to `O(1)` (where, `n` is total items), while trading off 100% accuracy.

## Requirements
* Node.js >= 6.10.0
* Yarn >= 0.21.3

## Setup
Run `make bootstrap`.

## Usage
1. Run `node ./bin index <absolute path of JSON data file>` to generate inverted index.
2. Run `node ./bin topk <sku code> -f <absolute path of JSON data file>` to get top 10 similar items.

# Troubleshooting
* Run `node ./bin help`.
* See any error displayed on the console.
* Check `./logs/recken-error.log` file.

## References
1. <a id=f1 href=#a1>^</a> Included as a command in the engine.
2. <a id=f2 href=#a2>^</a> Not included in the engine, should be a part of the platform.
3. <a id=f3 href=#a3>^</a> Since the structure of inverted index is `{ attributes -> attribute-values -> items }`.
4. <a id=f4 href=#a4>^</a> [Efficient Computation of Frequent and Top-k Elements in Data Streams](https://www.cs.ucsb.edu/research/tech-reports/2005-23)
