import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Re-Entry Interval After Mosquito Barrier Spray | SprayBossPro',
  description: 'How re-entry intervals vary by mosquito control product and how to automatically send the right interval based on what the tech actually applied.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">SprayBossPro Blog &mdash; Customer Communication</p>
        <h1>What Re-Entry Interval Should You Send Customers After Mosquito Barrier Spray?</h1>

        <p>After a mosquito barrier spray application, customers need to know when it&apos;s safe to go back into their yard. The answer is not a fixed &quot;30 minutes&quot; or &quot;1 hour&quot; — it depends on the specific product applied, the formulation, the application method, and in some cases the application site conditions. Sending a generic re-entry interval in your post-service text is both inaccurate for products that differ from your default and potentially a liability issue if a customer or pet re-enters before the actual safe interval. The re-entry interval in the customer notification must come from the product label for what was actually applied.</p>

        <h2>Common Mosquito Barrier Products and Their REIs</h2>
        <p>Most residential mosquito barrier spray programs use pyrethroid-based products. Common categories and their typical re-entry intervals:</p>
        <ul>
          <li><strong>Bifenthrin-based products</strong> (Talstar, Bifen IT) — Typically 1 hour after surfaces dry. Some formulations specify &quot;until dry.&quot;</li>
          <li><strong>Permethrin-based products</strong> (Permethrin SFR, Martins Permethrin) — Typically 12 hours for some formulations, others specify until dry. Check the specific label.</li>
          <li><strong>Lambda-cyhalothrin products</strong> (Demand CS) — Typically 1 to 2 hours after surfaces dry, per label.</li>
          <li><strong>Natural/botanical products</strong> (cedar oil, garlic-based) — Often 30 minutes or until dry; varies significantly by brand and formulation.</li>
        </ul>
        <p>None of these are the same. A blanket &quot;please stay out of the yard for 30 minutes&quot; message sent after a permethrin application with a 12-hour REI is materially incorrect — and could lead to customer or pet exposure during the restricted period.</p>

        <h2>How the Product Library Drives Accurate REI Texts</h2>
        <p>In purpose-built <a href="/mosquito-control-software">mosquito control software</a>, the product library stores the re-entry interval for each product alongside the EPA registration number, active ingredient, and standard application rate. When a technician selects the product applied in their field logging form, the REI pre-populates from the product library. When the compliance log is submitted and the stop marked complete, the post-service SMS fires using that product-specific REI — not a hardcoded template interval. The customer receives: &quot;Your mosquito barrier spray is complete. Please keep people and pets out of treated areas for [product-specific REI] while the product dries. Your next treatment is estimated for [Date].&quot;</p>

        <h2>Multiple Products in One Application</h2>
        <p>Some mosquito programs pair a primary barrier spray with a larvicide or a different product for specific treatment areas (standing water, dense vegetation). When two products with different REIs are applied in the same visit, the post-service notification should reference the longer of the two REIs — so the customer doesn&apos;t re-enter based on the shorter interval while the longer-REI product is still active. The compliance log records both products; the SMS uses the maximum REI across both for the customer notification.</p>

        <h2>REI Notification Language for Kids and Pets</h2>
        <p>Mosquito customers almost universally ask about children and pets. The REI notification should address both explicitly: &quot;Please keep children and pets out of treated yard areas for [REI] while the product dries. Once surfaces are dry and the re-entry interval has passed, the yard is safe for normal use.&quot; Language that calls out children and pets specifically is more reassuring than a generic &quot;stay out of treated areas&quot; message — it answers the question customers have before they ask it.</p>

        <h2>REI Texts as Liability Management</h2>
        <p>A documented post-service SMS with the correct product-specific REI, delivered to the customer&apos;s phone at the time of service completion, creates a timestamped record that the customer was notified of the correct re-entry interval. In the event of a complaint about product exposure — a child playing in the yard before the REI elapsed — this notification record is a meaningful element of the company&apos;s defense. A text message log showing the correct REI was communicated immediately after service is far more defensible than a signed service agreement with a generic REI that may not match the product actually applied that day.</p>

        <p>For how the circle routing workflow gets technicians to properties so they can apply the right products and submit accurate compliance logs, see <a href="/blogs/build-mosquito-control-routes-circle-map">How to Build Mosquito Control Routes Using Circle Map Route Building</a>.</p>

        <div className="blog-cta-box">
          <h3>Product-specific re-entry interval. Sent automatically. To the right customer. Within seconds of service completion.</h3>
          <p>SprayBossPro fires post-service SMS with the REI pulled directly from the applied product in the compliance log — correct interval, specific to what was actually sprayed, delivered before the technician leaves the driveway.</p>
          <a href="https://my.spraybosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: re-entry interval mosquito barrier spray, mosquito control REI text, mosquito barrier spray re-entry, post-service mosquito control SMS, mosquito treatment re-entry notification, mosquito spray re-entry interval customer
        </div>
      </article>
    </BlogShell>
  );
}
