import app from './App.js';
import { PORT } from './utils/configs.js';

app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`); });