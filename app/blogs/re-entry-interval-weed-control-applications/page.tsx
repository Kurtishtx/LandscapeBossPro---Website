import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Re-Entry Interval After Weed Control Applications | LandscapeBossPro',
  description: 'How re-entry intervals vary by weed control product and how to capture the correct interval from the compliance log to send the right SMS.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">LandscapeBossPro Blog &mdash; Compliance &amp; Communication</p>
        <h1>What Re-Entry Interval Should You Send Customers After Weed Control Applications?</h1>

        <p>Re-entry interval (REI) is the minimum time that must pass after a pesticide application before people — including pets — can safely re-enter the treated area. For weed control products, REIs range from as short as 4 hours to as long as 48 hours depending on the specific product and formulation. Sending the right REI to every customer after every application is both a legal obligation and a liability issue. Getting it wrong — sending a 4-hour REI when the product requires 24 hours — exposes you to liability if a customer or pet enters the treated area too early.</p>

        <h2>Why REIs Vary Between Weed Control Products</h2>
        <p>Different herbicide active ingredients have different toxicity profiles and different movement-from-treated-surface rates. A product with low toxicity and fast surface dry time may carry a 4-hour REI. A product with systemic activity applied at higher rates may carry a 24 or 48-hour REI. Specialty products for nutsedge or sedge control may have their own REI distinct from your standard broadleaf herbicide.</p>
        <p>The REI is stated on the pesticide label and is legally required to be communicated to customers. Most state pesticide regulations require that customers receive notification of the REI before or at the time of service. Using a fixed REI for all products — regardless of what was actually applied — is both technically inaccurate and a compliance shortcut that can catch you in an inspection or liability claim.</p>

        <h2>Capturing the Correct REI at the Time of Application</h2>
        <p>The correct REI should come from the compliance log, not from a static SMS template. When a technician selects the product applied from the product library in the mobile logging form, the REI associated with that product should pre-populate in the log. When the log is submitted and the job is marked complete, the automated post-service SMS fires using the REI from that log — not a generic &quot;please stay off the lawn for 4 hours&quot; message.</p>
        <p>In purpose-built <a href="/weed-control-software">weed control software</a>, the product library stores each product&apos;s REI. The compliance log pre-fills it from the selected product. The post-service SMS template pulls the REI from the completed log. The customer receives the correct interval for the specific product applied at their property on that visit.</p>

        <h2>Product Library Setup for REI Accuracy</h2>
        <p>REI accuracy starts with a properly built product library. For each weed control product your company applies, the library entry should include:</p>
        <ul>
          <li>Product name and EPA registration number</li>
          <li>Active ingredient and formulation type</li>
          <li>Re-entry interval (hours)</li>
          <li>Standard application rate per 1,000 sq ft</li>
        </ul>
        <p>When the product is selected in the field logging form, all of this data pre-populates. The technician confirms or adjusts the rate; the REI is pulled automatically. No technician is trying to remember which product carries a 24-hour REI versus a 4-hour one while standing in a customer&apos;s driveway.</p>

        <h2>The SMS Template That Uses the Dynamic REI</h2>
        <p>A well-structured post-application SMS for weed control looks something like: &quot;Hi [Customer First Name] — your weed control application is complete. Please keep people and pets off the treated areas for [REI] hours after application to allow the product to dry completely. Your next scheduled visit is approximately [Next Round Date]. Thank you for choosing [Company Name].&quot; The [REI] field is populated from the compliance log, not hardcoded. Every customer gets the right interval for what was actually applied.</p>

        <p>For the full in-field logging workflow that captures the REI alongside EPA reg numbers and application conditions, see <a href="/blogs/auto-schedule-post-emergent-weed-control">How to Auto-Schedule Post-Emergent Weed Control Rounds at the Right Interval</a>.</p>

        <div className="blog-cta-box">
          <h3>Every customer gets the right re-entry interval for what was actually applied at their property.</h3>
          <p>LandscapeBossPro pulls the REI from the completed compliance log and fires the post-service SMS with the correct interval — no static templates, no manually entered times, no liability exposure from wrong information.</p>
          <a href="https://my.landscapebosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: re-entry interval weed control, REI weed control SMS, weed control re-entry period, post-emergent re-entry interval, herbicide re-entry interval customer notification, pesticide re-entry interval text
        </div>
      </article>
    </BlogShell>
  );
}
