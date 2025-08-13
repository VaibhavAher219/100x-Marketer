import Marquee from "react-fast-marquee";
import Image from "next/image";

export default function SocialProof() {
  const logos = ['meta', 'hubspot', 'shopify', 'salesforce', 'netflix', 'airbnb', 'google', 'uber'];

  return (
    <section className="py-16 px-4">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-8 font-medium">
          Trusted by Marketers From
        </p>
        
        <Marquee gradient={true} gradientColor="[249, 249, 249]" speed={40}>
          {[...logos, ...logos, ...logos, ...logos].map((logo, index) => (
            <Image
              key={index}
              src={`/logos/${logo}.png`}
              alt={`${logo} logo`}
              width={80}
              height={40}
              className="w-20 mx-10 filter grayscale hover:grayscale-0 transition-all duration-300"
            />
          ))}
        </Marquee>
      </div>
    </section>
  );
} 