const generateStructuredData = (config) => {
  const { name, description, url, email, jobTitle, employer } = config;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description,
    url,
  };

  if (email) {
    structuredData.email = email;
  }

  if (jobTitle) {
    structuredData.jobTitle = jobTitle;
  }

  if (employer) {
    structuredData.worksFor = {
      "@type": "Organization",
      name: employer,
    };
  }

  return `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;
};

const meta = (config) => {
  if (!config || !config.name) {
    return `
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no">

        <link rel="icon" href="assets/favicon.ico" />

        <title>CV</title>
        <meta name="description" content="CV made with cv-maker">
    `;
  }

  const { description, name, preview, twitterUser, url } = config;

  return `
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no">

    <link rel="icon" href="assets/favicon.ico" />
    <link rel="canonical" href="${url}">

    <title>${name} CV</title>
    <meta name="description" content="${description}">

    <!--  Social tags -->
    <meta property="og:type" content="website">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${preview.image}">
    <meta property="og:site_name" content="The CV of ${name}">
    <meta property="og:title" content="The CV of ${name}">
    <meta property="og:url" content="${url}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image:alt" content="${preview.text}">
    <meta name="twitter:site" content="${twitterUser}">

    <!-- Structured data for AI/search engines -->
    ${generateStructuredData(config)}
  `;
};

export default meta;
