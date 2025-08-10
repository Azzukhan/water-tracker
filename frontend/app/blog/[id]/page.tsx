import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, ArrowLeft, Share2, Bookmark } from "lucide-react";
import Link from "next/link";

// This would typically fetch data based on the ID
const blogPost = {
  id: 1,
  title: "Understanding Flood Risk Assessment in the UK",
  content: `
    <p>Flood risk assessment is a critical component of water management and urban planning across the United Kingdom. With climate change increasing the frequency and severity of extreme weather events, understanding how flood risk is evaluated has never been more important.</p>
    
    <h2>What is Flood Risk Assessment?</h2>
    <p>Flood risk assessment is the process of evaluating the likelihood and potential consequences of flooding in a particular area. This involves analyzing various factors including:</p>
    
    <ul>
      <li>Historical flood data and patterns</li>
      <li>Topographical features and elevation</li>
      <li>Rainfall patterns and intensity</li>
      <li>River flow rates and capacity</li>
      <li>Coastal conditions and tidal influences</li>
      <li>Urban development and drainage systems</li>
    </ul>
    
    <h2>The UK Approach</h2>
    <p>The Environment Agency leads flood risk assessment in England, working alongside Natural Resources Wales, the Scottish Environment Protection Agency, and the Department for Infrastructure in Northern Ireland. These organizations use sophisticated modeling techniques and extensive data collection to create comprehensive flood risk maps.</p>
    
    <h3>Key Components of UK Flood Risk Assessment</h3>
    <p>The UK's approach to flood risk assessment involves several key components:</p>
    
    <ol>
      <li><strong>Probability Assessment:</strong> Determining the likelihood of flooding occurring in different scenarios</li>
      <li><strong>Consequence Assessment:</strong> Evaluating the potential impact on people, property, and the environment</li>
      <li><strong>Risk Mapping:</strong> Creating detailed maps that show areas at different levels of flood risk</li>
      <li><strong>Community Engagement:</strong> Involving local communities in understanding and preparing for flood risks</li>
    </ol>
    
    <h2>Modern Technology in Flood Risk Assessment</h2>
    <p>Today's flood risk assessments leverage cutting-edge technology including satellite imagery, IoT sensors, and artificial intelligence to provide more accurate and timely assessments. Real-time monitoring systems can detect changing conditions and update risk assessments dynamically.</p>
    
    <h2>Conclusion</h2>
    <p>Effective flood risk assessment is essential for protecting communities and infrastructure across the UK. As climate change continues to alter weather patterns, these assessments must evolve to incorporate new data and methodologies, ensuring that flood management strategies remain effective and communities stay safe.</p>
  `,
  author: {
    name: "Dr. Sarah Mitchell",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Dr. Sarah Mitchell is a leading hydrologist and flood risk specialist with over 15 years of experience in water management. She has worked extensively with the Environment Agency and various research institutions to develop innovative approaches to flood risk assessment and management.",
  },
  publishedAt: "2024-01-10T09:00:00Z",
  readTime: 8,
  category: "Education",
  tags: ["flood-risk", "assessment", "uk", "water-management"],
  image: "/placeholder.svg?height=400&width=800",
};

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>
      </Button>

      {/* Article Header */}
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4">
          {blogPost.category}
        </Badge>
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">{blogPost.title}</h1>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={blogPost.author.avatar || "/placeholder.svg"}
                alt={blogPost.author.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== "/placeholder.svg")
                    target.src = "/placeholder.svg";
                }}
              />
              <AvatarFallback>
                {blogPost.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{blogPost.author.name}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(blogPost.publishedAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {blogPost.readTime} min read
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Featured Image */}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-8">
          <img
            src={blogPost.image || "/placeholder.svg"}
            alt={blogPost.title}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== "/placeholder.svg")
                target.src = "/placeholder.svg";
            }}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none mb-8 dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
      </div>

      {/* Tags */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {blogPost.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Author Bio */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">About the Author</h3>
          <div className="flex gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={blogPost.author.avatar || "/placeholder.svg"}
                alt={blogPost.author.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== "/placeholder.svg")
                    target.src = "/placeholder.svg";
                }}
              />
              <AvatarFallback>
                {blogPost.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium mb-2">{blogPost.author.name}</h4>
              <p className="text-muted-foreground">{blogPost.author.bio}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
