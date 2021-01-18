const meta = (config) => {
  if(!config || !config.name) {
    return `
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no">

        <link rel="icon" href="assets/favicon.ico" />

        <title>CV</title>
        <meta name="description" content="CV made with cv-maker">
    `
  }
  
  return `
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no">

    <link rel="icon" href="assets/favicon.ico" />

    <title>${config.name} CV</title>
    <meta name="description" content="${config.description}">

    <!--  Social tags -->    
    <meta property="og:description" content="${config.description}">
    <meta property="og:image" content="${config.previewImage}">
    <meta property="og:site_name" content="The CV of ${config.name}">
    <meta property="og:title" content="The CV of ${config.name}">
    <meta property="og:url" content="${config.url}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image:alt" content="${config.previewImageText}">
    <meta name="twitter:site" content="${config.twitterUsername}">
  `
}

export default meta;