const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// The app now stores all data in Supabase (configured in public/index.html),
// so this server only needs to serve the static front-end.
app.use(express.static('public'));

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
