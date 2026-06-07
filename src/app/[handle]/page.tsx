interface Props {
  params: Promise<{ handle: string }>;
}

export default async function HandlePage({ params }: Props) {
  const { handle } = await params;

  return (
    <main>
      <h1>@{handle}</h1>
    </main>
  );
}
