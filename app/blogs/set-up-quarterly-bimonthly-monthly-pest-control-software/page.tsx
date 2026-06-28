import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Set Up Recurring Pest Control Programs in Software | LandscapeBossPro',
  description: 'The exact setup steps for configuring quarterly, bi-monthly, and monthly pest control programs in software so each interval auto-schedules correctly and tracks independently.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">LandscapeBossPro Blog &mdash; Pest Control Software</p>
        <h1>How to Set Up Quarterly, Bi-Monthly, and Monthly Programs in Pest Control Software</h1>

        <p>Running quarterly, bi-monthly, and monthly pest control programs simultaneously — for different customers on different plans — is the operational normal for most pest control companies. What shouldn&apos;t be normal is the overhead that comes with managing three different scheduling intervals without structured software: a quarterly account treated April 1 needs to surface in the waiting list around July 1, a bi-monthly account treated April 1 surfaces around June 1, and a monthly account treated April 1 surfaces around May 1. In a spreadsheet, these three calculations happen manually after every completion. In purpose-built <a href="/pest-control-software">pest control software</a>, each program type has its own configured interval and the auto-scheduling happens from the completion date without any manual calculation.</p>

        <h2>Setting Up the Package Plan</h2>
        <p>Each program type is configured as a package plan in the software:</p>
        <ul>
          <li><strong>Quarterly plan:</strong> 4 treatments per year, 90-day interval between treatments, services include Q1 through Q4 with configured product mixes and default rates for each</li>
          <li><strong>Bi-monthly plan:</strong> 6 treatments per year, 60-day interval, services labeled Visit 1 through Visit 6</li>
          <li><strong>Monthly plan:</strong> 12 treatments per year, 30-day interval, services labeled by month or visit number</li>
        </ul>
        <p>The interval is set at the service level within the package — so each service in the plan knows its own interval independently. A quarterly plan where Q1 has a different interval to Q2 (common in markets with late-spring startup timing) can be configured with per-service intervals rather than a single package-level interval.</p>

        <h2>Assigning Programs to Customers</h2>
        <p>When a package plan is assigned to a property, the software creates the full visit sequence in the waiting list. A quarterly plan assigned April 1 creates Q1 due April 1, Q2 due July 1, Q3 due October 1, Q4 due January 1. These due dates are initial targets — after the first completion, each subsequent visit reschedules from the actual completion date at the configured interval, not from the original target date. A Q1 that ran 10 days late (April 11) produces a Q2 due around July 11, not July 1. The schedule tracks actual program reality, not a fixed calendar grid.</p>

        <h2>Mixed-Program Customers</h2>
        <p>A customer who started on a quarterly plan in January and added a monthly interior baiting service in March has two active programs on the same property. The quarterly plan tracks at its 90-day interval. The monthly interior service tracks at its 30-day interval. Both appear as separate entries in the waiting list when their respective due dates arrive. The dispatcher sees both on the map, can schedule them on the same visit if it&apos;s efficient, or schedule them separately if the service types are handled by different crews or product sets.</p>

        <h2>Waiting List Filtering by Program Type</h2>
        <p>The waiting list can be filtered by service name to show only quarterly, only bi-monthly, or only monthly accounts due in the current period. This filter is the capacity planning tool for route builders who want to see how much work of each program type is due in the current week and whether it can be consolidated efficiently into existing routes.</p>

        <p>For what a state inspector checks in the records these programs generate, see <a href="/blogs/pest-control-state-inspector-chemical-logs">What Chemical Logs Does a State Pest Control Inspector Actually Ask For?</a></p>

        <div className="blog-cta-box">
          <h3>Quarterly. Bi-monthly. Monthly. Each interval configured once — auto-scheduling handles every visit forever.</h3>
          <p>LandscapeBossPro configures each pest control program interval at the service level so quarterly, bi-monthly, and monthly accounts all auto-schedule from their actual completion dates without any manual calculation between visits.</p>
          <a href="https://my.landscapebosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: set up quarterly pest control software, pest control bi-monthly monthly program software, pest control software program intervals, quarterly bi-monthly monthly pest control scheduling, pest control software multiple program types, pest control interval software setup
        </div>
      </article>
    </BlogShell>
  );
}
