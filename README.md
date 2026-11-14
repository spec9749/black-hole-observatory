# Black Hole Observatory: Netlify deploy

- `index.html`: the site. The Research page fetches `/api/feed` and shows the latest arXiv preprints.
- `netlify/functions/feed.mjs`: serverless function that queries the arXiv API and returns JSON (cached for an hour at the edge).
- `netlify.toml`: tells Netlify where the function lives.

Deploy (Git or CLI; drag-and-drop may not build functions):

    npm i -g netlify-cli
    netlify login
    netlify deploy --prod --dir=.

If the function is unreachable, the page quietly keeps the curated highlights.
