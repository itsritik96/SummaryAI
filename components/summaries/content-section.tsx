import { containerVariants, itemVariants } from "@/utils/constants";
import { MotionDiv } from "../common/motion.wrapper";

const BulletPoint = ({ point }: { point: string }) => {
    return (
      <MotionDiv
        variants={itemVariants} className="group relative bg-linear-to-br from-gray-200/[0.08] to-gray-400/[0.03] p-4 rounded-2xl border border-gray-500/10 hover:shadow-lg transition-all">
        <div className="absolute inset-0 bg-linear-to-r from-gray-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
        <p className="relative text-lg lg:text-xl text-muted-foreground/90 leading-relaxed text-left">
          {point}
        </p>
      </MotionDiv>
    );
  };
  
  export default function ContentSection({
    points,
  }: {
    points: string[];
  }) {
    return (
      <MotionDiv
        variants={containerVariants}
        key={points.join('')}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-4"
        >
        {points.map((point, index) => {
          if (!point.trim()) return null;
          return <BulletPoint key={`point-${index}`} point={point} />;
        })}
      </MotionDiv>
    );
  }
  