/**
 * Verified Review Modal
 * Modal for writing a review from the order detail page.
 * Only shown when order is delivered and payment is successful.
 * Reuses the same star rating pattern from ReviewsSection.
 */

"use client";

import { useState } from "react";
import { Star, X, ShieldCheck } from "lucide-react";
import { submitVerifiedReview } from "@/lib/api/reviews.api";
import { ApiError } from "@/lib/api";
import GlobalLoader from "@/components/common/GlobalLoader";

interface VerifiedReviewModalProps {
    productId: string;
    orderId: string;
    productName: string;
    onClose: () => void;
    onSuccess: (productId: string) => void;
}

export default function VerifiedReviewModal({
    productId,
    orderId,
    productName,
    onClose,
    onSuccess,
}: VerifiedReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!comment.trim()) {
            setError("Please write a review comment");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await submitVerifiedReview({
                productId,
                orderId,
                rating,
                comment: comment.trim(),
            });
            onSuccess(productId);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Failed to submit review. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-white">
                        <ShieldCheck size={20} strokeWidth={2.5} />
                        <h3 className="text-lg font-bold">Verified Purchase Review</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Product Name */}
                <div className="px-6 pt-4 pb-2">
                    <p className="text-sm text-gray-500">Reviewing:</p>
                    <p className="font-semibold text-gray-900 truncate">{productName}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                    {/* Rating Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                            Your Rating
                        </label>
                        <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-xl py-4 border-2 border-gray-200">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-all hover:scale-125 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
                                >
                                    <Star
                                        size={28}
                                        strokeWidth={2}
                                        className={
                                            star <= (hoverRating || rating)
                                                ? "text-amber-400 fill-amber-400 drop-shadow-md"
                                                : "text-gray-300 fill-gray-100"
                                        }
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-sm font-semibold text-gray-700 mt-2">
                            {rating} out of 5 stars
                        </p>
                    </div>

                    {/* Comment Textarea */}
                    <div>
                        <label
                            htmlFor="verified-review-comment"
                            className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2"
                        >
                            Your Review
                        </label>
                        <textarea
                            id="verified-review-comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none text-sm leading-relaxed placeholder:text-gray-400"
                            placeholder="Share your experience with this product..."
                            maxLength={1000}
                            required
                        />
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                                Be specific and honest
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                                {comment.length}/1000
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-sm px-4 py-3 rounded-xl font-medium bg-red-50 text-red-700 border-2 border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                        >
                            {submitting ? (
                                <>
                                    <GlobalLoader size="small" className="border-white" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Review"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
