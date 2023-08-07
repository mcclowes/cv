const meta = (config) => {
  if (!config || !config.name) {
    return `
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no">

        <link rel="icon" href="assets/favicon.ico" />

        <title>CV</title>
        <meta name="description" content="CV made with cv-maker">
    `;
  }

  const {
    description,
    name,
    preview,
    twitterUser,
    url,
  } = config

  return `
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no">

    <link rel="icon" href="assets/favicon.ico" />

    <title>${name} CV</title>
    <meta name="description" content="${description}">

    <!--  Social tags -->    
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${preview.image}">
    <meta property="og:site_name" content="The CV of ${name}">
    <meta property="og:title" content="The CV of ${name}">
    <meta property="og:url" content="${url}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image:alt" content="${preview.text}">
    <meta name="twitter:site" content="${twitterUser}">
  `;
};

export default meta;
