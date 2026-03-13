/**
 * Search Client for study-repository
 * 
 * Usage (browser):
 *   <script src="https://cdn.jsdelivr.net/npm/flexsearch/dist/flexsearch.bundle.min.js"></script>
 *   <script src="search-client.js"></script>
 *   <script>
 *     const searcher = new StudySearch("https://<user>.github.io/study-repository/");
 *     await searcher.init();
 *     const results = searcher.search("lập trình");
 *     // results = [{ id, type, title, author, file, faculty, course, ... }]
 *   </script>
 *
 * Usage (ESM):
 *   import { StudySearch } from './search-client.js';
 */
class StudySearch {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    this.entries = [];
    this.ready = false;
  }

  async init() {
    const res = await fetch(this.baseUrl + 'search-index.json');
    this.entries = await res.json();
    this.ready = true;
  }

  search(query, options = {}) {
    if (!this.ready) throw new Error('Call init() first');
    const q = query.toLowerCase().trim();
    const { type, faculty, course, limit = 50 } = options;

    let results = this.entries.filter(entry => {
      // Text match across multiple fields
      const haystack = [
        entry.title,
        entry.summary || '',
        entry.author,
        entry.courseName,
        entry.courseCode,
        entry.faculty,
        entry.course,
        ...(entry.keywords || []),
        entry.category || '',
        entry.description || '',
      ].join(' ').toLowerCase();

      if (!haystack.includes(q)) return false;
      if (type && entry.type !== type) return false;
      if (faculty && entry.faculty !== faculty) return false;
      if (course && entry.course !== course) return false;
      return true;
    });

    // Score: title match > keyword match > other
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(q) ? 2 : 0;
      const bTitle = b.title.toLowerCase().includes(q) ? 2 : 0;
      const aKw = (a.keywords || []).some(k => k.toLowerCase().includes(q)) ? 1 : 0;
      const bKw = (b.keywords || []).some(k => k.toLowerCase().includes(q)) ? 1 : 0;
      return (bTitle + bKw) - (aTitle + aKw);
    });

    return results.slice(0, limit);
  }

  getByFile(filePath) {
    return this.entries.find(e => e.file === filePath) || null;
  }

  getByType(type) {
    return this.entries.filter(e => e.type === type);
  }

  getByFaculty(faculty) {
    return this.entries.filter(e => e.faculty === faculty);
  }

  getByCourse(course) {
    return this.entries.filter(e => e.course === course);
  }

  getFaculties() {
    return [...new Set(this.entries.map(e => e.faculty))];
  }

  getCourses(faculty) {
    const filtered = faculty ? this.entries.filter(e => e.faculty === faculty) : this.entries;
    const seen = new Map();
    for (const e of filtered) {
      if (!seen.has(e.course)) {
        seen.set(e.course, { course: e.course, courseName: e.courseName, courseCode: e.courseCode, faculty: e.faculty });
      }
    }
    return [...seen.values()];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StudySearch };
}
