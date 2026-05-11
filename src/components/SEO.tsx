import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../lib/useSiteSettings';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
  canonical?: string;
  publishedTime?: string;
  authorName?: string;
}

export default function SEO({ title, description, image, article, canonical, publishedTime, authorName }: SEOProps) {
  const { settings } = useSiteSettings();
  
  const siteName = settings.agency_name || "Diffuse Agency";
  const defaultTitle = `${siteName} | Elite Web Engineering`;
  const defaultDesc = settings.seo_description || "Transformando visão em realidade digital através de engenharia sênior e design de alta fidelidade.";
  
  const seo = {
    title: title ? `${title} | ${siteName}` : settings.seo_title || defaultTitle,
    description: description || defaultDesc,
    image: image || settings.seo_image || '',
    url: window.location.href,
    canonical: canonical || window.location.href.split('?')[0],
  };

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      <link rel="canonical" href={seo.canonical} />
      
      <meta property="og:site_name" content={siteName} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      {seo.image && <meta property="og:image" content={seo.image} />}
      
      {article && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {article && authorName && (
        <meta property="article:author" content={authorName} />
      )}
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      {seo.image && <meta name="twitter:image" content={seo.image} />}

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": article ? "BlogPosting" : "Organization",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": seo.url
          },
          "name": siteName,
          "headline": title || seo.title,
          "description": seo.description,
          "image": seo.image,
          "url": seo.url,
          ...(article ? {
            "datePublished": publishedTime || new Date().toISOString(),
            "author": {
              "@type": "Person",
              "name": authorName || siteName
            },
            "publisher": {
              "@type": "Organization",
              "name": siteName,
              "logo": {
                "@type": "ImageObject",
                "url": settings.agency_logo || ""
              }
            }
          } : {
            "logo": settings.agency_logo || ""
          })
        })}
      </script>

      {settings.analytics_id && !window.location.pathname.startsWith('/admin') && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.analytics_id}`}></script>
      )}
      {settings.analytics_id && !window.location.pathname.startsWith('/admin') && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${settings.analytics_id}');
          `}
        </script>
      )}
    </Helmet>
  );
}
