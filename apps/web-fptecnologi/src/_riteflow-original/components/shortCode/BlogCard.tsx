import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ArrowTopRight from '@riteflow/components/icons/ArrowTopRight';
import type { BlogPost } from '@riteflow/data/blogData';

/**
 * BlogCard Component
 * 
 * Displays a single blog post card with image, category, title, and description.
 * Includes hover animations and links to blog details page.
 * 
 * @example
 * <BlogCard blog={blogPost} />
 * 
 * @param blog - Blog post data object
 */
export interface BlogCardProps {
  blog: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  return (
    <div
      className="p-2.5 bg-blue rounded-xl sm:rounded-2xl md:rounded-[20px] group border-moving relative before:rounded-xl sm:before:rounded-2xl md:before:rounded-[20px] flex flex-col gap-5 border border-lineColor/70"
      data-sttr-card >
      <Link
        href={blog.href}
        className="rounded-20 overflow-hidden border border-lineColor/70 border-b-0 relative block"
        data-lag="0.02"
      >
        <Image
          src={blog.image.src}
          alt={blog.image.alt}
          width={400}
          height={250}
          className="group-hover:scale-105 transition-all duration-500 ease-in-out w-full h-auto"
        />
        <div className="absolute w-full h-full bottom-0 left-0 z-10 bg-linear-to-b from-secondary/0 to-secondary/50 duration-300 group-hover:h-0"></div>
      </Link>
      <div className="rounded-20 border border-lineColor/70 bg-blue p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="#"
            className="bg-linear-to-b from-slateBlue/20 to-royalBlue/20 rounded-[10px] py-1.5 px-3 inline-block text-sm text-offWhite/80 font-medium hover:text-white transition-all duration-300 ease-in-out"
          >
            {blog.category}
          </Link>
          <Link
            href={blog.href}
            className="w-11 h-9 flex items-center justify-center bg-linear-to-b from-slateBlue/20 to-royalBlue/20 rounded-[10px] relative overflow-hidden"
          >
            <ArrowTopRight className="w-6 h-6 fill-current text-white transition-all duration-300 ease-in-out group-hover:translate-x-6 group-hover:-translate-y-5 group-hover:opacity-0" />
            <ArrowTopRight className="w-6 h-6 fill-current text-white absolute transform -translate-x-6 translate-y-5 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:-translate-y-0 opacity-0 group-hover:opacity-100" />
          </Link>
        </div>
        <div className="my-5 gradient-border w-full h-[1px]"></div>
        <h3 className="text-xl text-offWhite font-medium">
          <Link href={blog.href} className="text-underline text-offWhite">
            {blog.title}
          </Link>
        </h3>
        <p className="mt-4 text-offWhite/60">{blog.description}</p>
      </div>
    </div>
  );
};

BlogCard.displayName = 'BlogCard';

export default BlogCard;
