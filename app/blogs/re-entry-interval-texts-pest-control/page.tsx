import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Re-Entry Interval Texts After Pest Control Visits | SprayBossPro',
  description: 'How re-entry interval SMS fires automatically based on the product and interval logged by the technician in the field.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">SprayBossPro Blog &mdash; Customer Communication</p>
        <h1>How to Send Re-Entry Interval Texts After Every Pest Control Application Automatically</h1>

        <p>Re-entry interval (REI) notification after pest control applications is both a regulatory requirement in most states and the most important customer communication your company sends. A customer who just had their home treated needs to know when it&apos;s safe to go back inside, when children and pets can re-enter, and how long to keep windows open. Getting this information wrong — or not sending it at all — creates liability exposure and customer dissatisfaction simultaneously. Automating it correctly eliminates both risks.</p>

        <h2>Why the REI Must Come From the Applied Product, Not a Static Template</h2>
        <p>Different pest control products have different re-entry intervals. A pyrethroid applied at standard indoor concentration may carry a 4-hour REI after surfaces dry. A different product applied in the same visit may carry a 2-hour REI. A product used for German cockroach gel bait in a commercial kitchen may have a different REI still. Sending a static &quot;please stay out for 4 hours&quot; message regardless of what was actually applied is inaccurate for any product with a different REI — and potentially a liability issue if a customer or pet re-enters before the actual safe interval.</p>
        <p>The REI in the post-service text must come from the compliance log for that specific visit, not from a hardcoded template.</p>

        <h2>How the Product Library Powers Accurate REI Texts</h2>
        <p>In purpose-built <a href="/pest-control-scheduling-software">pest control scheduling software</a>, the product library stores the REI for each product alongside the EPA reg number, active ingredient, and standard application rate. When a technician selects the product applied in the field logging form, the REI pre-populates from the product library. When the log is submitted and the stop is marked complete, the post-service SMS fires using the REI from that specific log. The customer receives: &quot;Your pest control service is complete. Please keep people and pets out of treated areas for [REI] hours while the product dries. [Specific room or area instructions if applicable.] Your next quarterly service is estimated for [Date]. Questions? Reply here.&quot;</p>

        <h2>Multi-Product Visits and REI Handling</h2>
        <p>A pest control visit that applies multiple products — say, an interior spray and an exterior perimeter treatment — may involve products with different REIs. The post-service SMS should reference the longest REI of all products applied to ensure the customer doesn&apos;t re-enter before the most restrictive product has reached its safe interval. When multiple products are logged in the same visit, the system uses the maximum REI across all logged products for the post-service notification.</p>

        <h2>Interior vs. Exterior REI Communication</h2>
        <p>For a pest control company doing both interior and exterior treatments, the REI communication should specify which areas require re-entry restrictions. An exterior perimeter spray may have a 1-hour REI after dry. An interior treatment may have a 4-hour REI before re-occupancy. Sending a single &quot;please stay out for 4 hours&quot; message for an exterior-only application is unnecessarily restrictive. The post-service SMS template should reflect the treatment areas logged by the technician.</p>

        <h2>REI Texts as a Compliance Defense</h2>
        <p>In the event of a re-entry incident claim — a customer or pet allegedly re-entering before the safe interval — having documented REI notification delivered to the customer&apos;s mobile number at the time of service completion is a meaningful defense. The notification timestamp, the correct REI stated, and the delivery confirmation form a contemporaneous record showing the customer was notified of the correct re-entry interval for the specific products applied. This is far more defensible than a generic signed service agreement that states a fixed re-entry interval for all services.</p>

        <p>For the full compliance log workflow that captures the product, EPA reg number, and REI that drive accurate post-service texts, see <a href="/blogs/epa-compliance-records-pest-control">What EPA Compliance Records Do Pest Control Companies Need on Every Job?</a></p>

        <div className="blog-cta-box">
          <h3>The right re-entry interval to the right customer the moment the log is submitted.</h3>
          <p>SprayBossPro fires post-service SMS with the product-specific REI from the compliance log automatically on every stop — correct interval, correct customer, zero manual sends required.</p>
          <a href="https://my.spraybosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: re-entry interval texts pest control, pest control REI SMS, post-application pest control text, pest control re-entry notification, automatic re-entry interval pest control, pesticide re-entry text automation
        </div>
      </article>
    </BlogShell>
  );
}
