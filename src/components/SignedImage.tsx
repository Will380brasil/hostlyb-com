import { useSignedUrl, type Bucket } from "@/lib/storage";

interface Props extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  bucket: Bucket;
  path: string | null | undefined;
  fallback?: React.ReactNode;
}

export function SignedImage({ bucket, path, fallback = null, alt = "", ...rest }: Props) {
  const url = useSignedUrl(bucket, path);
  if (!path) return <>{fallback}</>;
  if (!url) return <>{fallback}</>;
  return <img src={url} alt={alt} {...rest} />;
}
