"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Layout, TrendingUp, Heart, ArrowRight, Zap, Mail, X, User, Calendar, Eye, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface FeaturedTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  likes: number;
  usageCount: number;
  rating: number;
  tags: string[];
  createdByName: string;
  createdAt: string;
}

interface TemplateStat {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface TemplatesShowcaseProps {
  templateStats: TemplateStat[];
  containerVariants: any;
  itemVariants: any;
}

export default function TemplatesShowcase({ 
  templateStats, 
  containerVariants, 
  itemVariants 
}: TemplatesShowcaseProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [featuredTemplates, setFeaturedTemplates] = useState<FeaturedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Modal state
  const [selectedTemplate, setSelectedTemplate] = useState<FeaturedTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFeaturedTemplates();
  }, []);

  const fetchFeaturedTemplates = async () => {
    try {
      const response = await fetch("/api/templates/community?sortBy=popular&limit=3");
      const data = await response.json();
      
      if (data.success) {
        setFeaturedTemplates(data.templates.slice(0, 3));
      } else {
        setError(true);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (template: FeaturedTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTemplate(null), 300);
  };

  const handleLike = async (templateId: string) => {
    if (!session) {
      toast.error("Please sign in to like templates");
      router.push(`/api/auth/signin?callbackUrl=/`);
      return;
    }

    try {
      const response = await fetch(`/api/templates/${templateId}/like`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setFeaturedTemplates(
          featuredTemplates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  likes: data.liked ? t.likes + 1 : t.likes - 1,
                }
              : t
          )
        );
        
        // Update selected template if it's open in modal
        if (selectedTemplate && selectedTemplate.id === templateId) {
          setSelectedTemplate({
            ...selectedTemplate,
            likes: data.liked ? selectedTemplate.likes + 1 : selectedTemplate.likes - 1,
          });
        }
        
        toast.success(data.liked ? "Template liked!" : "Like removed");
      }
    } catch (error) {
      toast.error("Failed to like template");
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    if (!session) {
      toast.error("Please sign in to use templates");
      router.push(`/api/auth/signin?callbackUrl=/`);
      return;
    }

    try {
      const response = await fetch(`/api/templates/${templateId}/use`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Template added to your collection!");
        fetchFeaturedTemplates();
      }
    } catch (error) {
      toast.error("Failed to use template");
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-4">
            <Layout className="w-8 h-8 text-purple-500" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Community Templates
            </h2>
          </motion.div>
          <motion.p variants={itemVariants} className="text-gray-400 text-lg max-w-2xl mx-auto">
            Save time with pre-built email templates created by the community. 
            Find the perfect template or create your own to share.
          </motion.p>
        </motion.div>

        {/* Template Cards or Empty State - NO MOTION HERE */}
        <div className="mb-12">
          {loading ? (
            // Loading Skeleton
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-900 rounded-2xl p-6 border border-gray-800 animate-pulse"
                >
                  <div className="h-6 bg-gray-800 rounded mb-4"></div>
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          ) : featuredTemplates.length > 0 ? (
            // Template Cards - REMOVED MOTION.DIV WRAPPER AND VARIANTS
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTemplates.map((template, index) => (
                <div
                  key={template.id}
                  className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden"
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-600/30 font-medium">
                        {template.category}
                      </span>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>

                    {/* Template Name */}
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-1">
                      {template.name}
                    </h3>

                    {/* Subject Preview */}
                    <div className="mb-3 bg-gray-800/60 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1 font-medium">Subject:</p>
                      <p className="text-sm text-white font-medium line-clamp-2">
                        {template.subject}
                      </p>
                    </div>

                    {/* Body Preview */}
                    <div className="mb-4 bg-gray-800/40 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1 font-medium">Preview:</p>
                      <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                        {template.body}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs mb-4">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-pink-500" />
                        <span className="text-gray-300">{template.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span className="text-gray-300">{template.usageCount} uses</span>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {template.createdByName?.[0] || "?"}
                      </div>
                      <span className="text-xs text-gray-300">by {template.createdByName || "Anonymous"}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(template.id);
                        }}
                        className="bg-gray-700/50 hover:bg-gray-700 cursor-pointer border border-gray-600 hover:border-gray-500 px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        <Heart className="w-3 h-3" />
                        Like
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(template);
                        }}
                        className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 text-xs"
                      >
                        <Eye className="w-3 h-3" />
                        View Full
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-16 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-800">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  No Templates Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Be the first to create and share an email template with the community!
                </p>
                <Link href="/templates/create">
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    Create First Template
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action Buttons */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.div variants={itemVariants}>
            <Link href="/templates/community">
              <button className="cursor-pointer group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105">
                Browse All Templates
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/templates/create">
              <button className="cursor-pointer group bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2 border border-gray-700 hover:border-gray-600 hover:scale-105">
                <Layout className="w-5 h-5 text-purple-400" />
                Create Template
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl p-8 border border-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {templateStats.map((stat, index) => (
              <motion.div key={index} variants={itemVariants} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`text-${stat.color}-400`}>{stat.icon}</div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Gmail-Style Modal */}
      <AnimatePresence>
        {isModalOpen && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl"
            >
              {/* Modal Header - Gmail Style */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 border-b border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedTemplate.name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs">
                        {selectedTemplate.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{selectedTemplate.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span>{selectedTemplate.likes}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white cursor-pointer transition p-2 hover:bg-gray-800 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {selectedTemplate.createdByName?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {selectedTemplate.createdByName || "Anonymous"}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Created {new Date(selectedTemplate.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body - Gmail Email Style */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                {/* Email Preview Container */}
                <div className="bg-white text-black rounded-lg shadow-lg overflow-hidden">
                  {/* Email Header */}
                  <div className="bg-gray-50 border-b border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-600 font-medium">
                        Email Preview
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Subject: {selectedTemplate.subject}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>From: {selectedTemplate.createdByName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(selectedTemplate.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="p-6 bg-white">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
                        {selectedTemplate.body}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-800 p-6 border-t border-gray-700 flex gap-3">
                <button
                  onClick={() => handleLike(selectedTemplate.id)}
                  className=" cursor-pointer flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Like Template
                </button>
                <button
                  onClick={() => {
                    handleUseTemplate(selectedTemplate.id);
                    closeModal();
                  }}
                  className="cursor-pointer flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Layout className="w-5 h-5" />
                  Use This Template
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
