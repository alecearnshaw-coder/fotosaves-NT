import { notFound } from 'next/navigation';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Props {
  params: Promise<{
    static: string[];
  }>;
}

export default async function StaticPage({ params }: Props) {
  const { static: staticPath } = await params;

  // Join the path segments
  const filePath = staticPath.join('/');

  // Try to serve the HTML file directly
  const fullPath = join(process.cwd(), 'public', `${filePath}.html`);

  if (existsSync(fullPath)) {
    try {
      const htmlContent = readFileSync(fullPath, 'utf8');

      // Process the HTML for path corrections
      const processedContent = htmlContent
        // Fix relative paths
        .replace(/(href|src)="(\.\.[^"]*)"/g, (match, attr, relativePath) => {
          const fixedPath = relativePath.replace(/^\.\.\//, '/');
          return `${attr}="${fixedPath}"`;
        })
        // Add basic styling for legacy pages
        .replace('<body', '<body style="background-color: #999973; margin: 0; padding: 20px;"');

      return (
        <div dangerouslySetInnerHTML={{ __html: processedContent }} />
      );
    } catch (error) {
      console.error(`Error reading static file: ${fullPath}`, error);
      notFound();
    }
  }

  notFound();
}

export async function generateMetadata({ params }: Props) {
  const { static: staticPath } = await params;
  const filePath = staticPath.join('/');

  return {
    title: `${filePath} | FotosAves.com.ar`,
  };
}






