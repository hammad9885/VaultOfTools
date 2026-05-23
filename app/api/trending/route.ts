import { NextResponse } from "next/server";

export async function GET() {
  const query = `
    query {
      posts(first: 8, topic: "artificial-intelligence", order: VOTES) {
        edges {
          node {
            name
            tagline
            votesCount
            website
            thumbnail {
              url
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.producthunt.com/v2/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PRODUCT_HUNT_TOKEN}`,
    },
    body: JSON.stringify({ query }),
    next: { revalidate: 3600 },
  });

  const data = await res.json();

  const tools = data?.data?.posts?.edges?.map(
    (edge: any, index: number) => ({
      rank: index + 1,
      name: edge.node.name,
      votes: edge.node.votesCount,
      tagline: edge.node.tagline,
      thumbnail: edge.node.thumbnail?.url,
      website: edge.node.website,
    })
  );

  return NextResponse.json(tools ?? []);
}