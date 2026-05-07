import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../lib/useSiteSettings';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
}

export default function SEO({ title, description, image, article }: SEOProps) {
  const { settings } = useSiteSettings();
  
  const defaultTitle = "Diffuse Agency | Elite Web Engineering";
  const defaultDesc = "Transformando visão em realidade digital através de engenharia sênior e design de alta fidelidade.";
  
  const seo = {
    title: title || settings.seo_title || defaultTitle,
    description: description || settings.seo_description || defaultDesc,
    image: image || settings.seo_image || '',
    url: window.location.href,
  };

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      
      {seo.url && <meta property="og:url" content={seo.url} />}
      {(article ? true : null) && <meta property="og:type" content="article" />}
      {seo.title && <meta property="og:title" content={seo.title} />}
      {seo.description && <meta property="og:description" content={seo.description} />}
      {seo.image && <meta property="og:image" content={seo.image} />}
      
      <meta name="twitter:card" content="summary_large_image" />
      {seo.title && <meta name="twitter:title" content={seo.title} />}
      {seo.description && <meta name="twitter:description" content={seo.description} />}
      {seo.image && <meta name="twitter:image" content={seo.image} />}

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
