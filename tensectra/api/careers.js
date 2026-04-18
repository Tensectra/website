// api/careers.js
//
// Server-side renders the careers page with JobPosting JSON-LD
// statically embedded in <head> so Google Jobs can index it
// WITHOUT needing to execute JavaScript (second-wave crawl problem).
//
// Vercel rewrite sends /pages/careers here instead of the static HTML.
// The static pages/careers.html still works locally and as fallback.

var fs   = require('fs');
var path = require('path');

export default async function handler(req, res) {

  // Validate env vars (coding standards rule 8)
  var supabaseUrl = process.env.SUPABASE_URL;
  var supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[careers SSR] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    // Fall back to static file — better than an error page
    return serveFallback(res);
  }

  // Fetch all active jobs via REST API (no SDK needed)
  var jobs = [];
  try {
    var jobsRes = await fetch(
      supabaseUrl + '/rest/v1/jobs?is_active=eq.true&order=date_posted.desc&select=*',
      {
        headers: {
          'apikey':        supabaseKey,
          'Authorization': 'Bearer ' + supabaseKey,
          'Content-Type':  'application/json'
        }
      }
    );
    if (jobsRes.ok) {
      jobs = await jobsRes.json();
    } else {
      console.error('[careers SSR] Supabase error:', jobsRes.status);
    }
  } catch (err) {
    console.error('[careers SSR] Fetch failed:', err.message);
  }

  // Build one <script type="application/ld+json"> block per job
  // Google Jobs reads these directly from the HTML — no JS needed
  var today = new Date().toISOString().slice(0, 10);
  var jsonldBlocks = (jobs || []).map(function(job) {
    var schema = {
      '@context':     'https://schema.org/',
      '@type':        'JobPosting',
      'title':        job.title,
      'description':  job.description || job.title,
      'datePosted':   job.date_posted ? job.date_posted.slice(0, 10) : today,
      'hiringOrganization': {
        '@type':  'Organization',
        'name':   'Tensectra',
        'sameAs': 'https://tensectra.com',
        'logo':   'https://tensectra.com/images/logo-mark.svg'
      },
      'employmentType': job.employment_type || 'FULL_TIME',
      'jobLocation': {
        '@type': 'Place',
        'address': {
          '@type':          'PostalAddress',
          'addressLocality': job.location_city    || 'Remote',
          'addressCountry':  job.location_country || 'NG'
        }
      }
    };

    // Remote work flag -- schema.org telecommute marker
    if (job.work_model === 'REMOTE') {
      schema['jobLocationType'] = 'TELECOMMUTE';
    }

    // Closing date -- required to avoid Google "stale listing" penalty
    if (job.valid_through) {
      schema['validThrough'] = job.valid_through;
    }

    // Direct apply URL
    if (job.apply_url) {
      schema['url'] = job.apply_url;
    }

    // Salary -- boosts Google Jobs ranking significantly
    if (job.salary_min) {
      schema['baseSalary'] = {
        '@type':    'MonetaryAmount',
        'currency': job.salary_currency || 'NGN',
        'value': {
          '@type':    'QuantitativeValue',
          'minValue': job.salary_min,
          'maxValue': job.salary_max || job.salary_min,
          // schema.org valid values: HOUR, DAY, WEEK, MONTH, YEAR
          'unitText': job.salary_unit || 'YEAR'
        }
      };
    }

    return '  <script type="application/ld+json">\n'
      + JSON.stringify(schema, null, 2)
      + '\n  </script>';
  }).join('\n');

  // Read the static careers.html from disk
  var htmlPath = path.join(process.cwd(), 'pages', 'careers.html');
  var html;
  try {
    html = fs.readFileSync(htmlPath, 'utf8');
  } catch (err) {
    console.error('[careers SSR] Could not read careers.html:', err.message);
    return serveFallback(res);
  }

  // Inject JSON-LD blocks just before </head>
  // This is what Googlebot reads on first-wave crawl (no JS execution needed)
  if (jsonldBlocks) {
    html = html.replace('</head>', jsonldBlocks + '\n</head>');
  }

  // Cache for 1 hour, stale-while-revalidate for 24h
  // Means Google sees fresh jobs within 1 hour of posting
  res.setHeader('Content-Type',  'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  return res.status(200).send(html);
}

function serveFallback(res) {
  // Last resort: redirect to static file
  res.setHeader('Location', '/pages/careers');
  return res.status(302).send('');
}
