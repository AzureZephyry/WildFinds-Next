import HashScroll from "@/components/HashScroll";

export default function AboutPage() {
  return (
    <main className="page-layout">
      <HashScroll />

      <section id="about" className="about-grid">
        <article className="info-card">
          <p className="eyebrow">About WildFinds</p>
          <h2>A centralized lost and found web application for CIT-U.</h2>
          <p>
            WildFinds is designed for Cebu Institute of Technology - University
            students, faculty, and staff. It provides a single place to report
            lost or found items, search campus reports, and improve the recovery
            process.
          </p>
        </article>

        <article className="info-card">
          <p className="eyebrow">Problem statement</p>
          <h2>Why WildFinds exists</h2>
          <ul className="info-list">
            <li>
              Lost items are often scattered across different offices or guard
              houses.
            </li>
            <li>
              Students may not know where to look for their lost belongings.
            </li>
            <li>
              Found items may not be turned in because the process feels
              inconvenient.
            </li>
            <li>
              Social media groups are not dedicated systems for lost and found
              reports.
            </li>
            <li>
              Matching items with the rightful owner can be difficult without a
              central system.
            </li>
          </ul>
        </article>
      </section>

      <section id="how-it-works" className="section-panel">
        <p className="eyebrow">How it works</p>
        <h2>WildFinds user flow</h2>
        <div className="how-grid">
          <div className="flow-card">
            <h3>Lost item</h3>
            <ol>
              <li>User loses an item</li>
              <li>Searches WildFinds</li>
              <li>Cannot find it</li>
              <li>Submits Lost Item Report</li>
              <li>Item can be matched/recovered</li>
            </ol>
          </div>
          <div className="flow-card">
            <h3>Found item</h3>
            <ol>
              <li>User finds an item</li>
              <li>Submits Found Item Report</li>
              <li>Owner can search and claim it</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="section-panel">
        <p className="eyebrow">Features</p>
        <h2>Current MVP and future improvements</h2>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Current MVP</h3>
            <ul>
              <li>Search items</li>
              <li>Lost Items browsing</li>
              <li>Found Items browsing</li>
              <li>Report Lost Item</li>
              <li>Report Found Item</li>
              <li>Item details</li>
              <li>Pagination</li>
            </ul>
          </article>
          <article className="feature-card">
            <h3>Future improvements</h3>
            <ul>
              <li>User accounts</li>
              <li>Database integration</li>
              <li>Item verification</li>
              <li>Claim tracking</li>
              <li>Administrative dashboard</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="team" className="section-panel team-section">
        <p className="eyebrow">Developers / Team</p>
        <h2>Project contributors</h2>
        <div className="team-grid">
          <article className="team-card">
            <div className="team-avatar">Image</div>
            <div>
              <h3>Prince Mark Barcelon</h3>
              <p>University: Cebu Institute of Technology - University</p>
              <p>Course: Bachelor of Science in Information Technology</p>
              <p>Year: 2nd Year</p>
              <p>Role: Project lead / UI design</p>
            </div>
          </article>
          <article className="team-card">
            <div className="team-avatar">Image</div>
            <div>
              <h3>Christan</h3>
              <p>University: Cebu Institute of Technology - University</p>
              <p>Course: Bachelor of Science in Information Technology</p>
              <p>Year: 2nd Year</p>
              <p>Role: Front-end development</p>
            </div>
          </article>
          <article className="team-card">
            <div className="team-avatar">Image</div>
            <div>
              <h3>Ali</h3>
              <p>University: Cebu Institute of Technology - University</p>
              <p>Course: Bachelor of Science in Information Technology</p>
              <p>Year: 2nd Year</p>
              <p>Role: UX and content</p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
