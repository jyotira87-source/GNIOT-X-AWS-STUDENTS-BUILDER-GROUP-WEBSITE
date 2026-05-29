import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VerifyEmailStatus from "@/components/custom/auth/VerifyEmailStatus";

type PageProps = { searchParams?: Promise<{ token?: string }> };

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params?.token || "";

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>Verify email</CardTitle>
      </CardHeader>
      <CardContent>
        <VerifyEmailStatus token={token} />
      </CardContent>
    </Card>
  );
}
