'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Review } from '@/types'
import StarRating from './StarRating'
import { Button } from './button'
import { Badge } from './Badge'

interface ReviewCardProps {
  review: Review
  onReport?: (reviewId: string, reason: string, description: string) => void
  showProduct?: boolean
  className?: string
}

export default function ReviewCard({ 
  review, 
  onReport, 
  showProduct = false,
  className = '' 
}: ReviewCardProps) {
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)

  const handleReport = async () => {
    if (!onReport || !reportReason || !reportDescription) return
    
    setIsSubmittingReport(true)
    try {
      await onReport(review.id, reportReason, reportDescription)
      setShowReportForm(false)
      setReportReason('')
      setReportDescription('')
    } catch (error) {
      console.error('Error reporting review:', error)
    } finally {
      setIsSubmittingReport(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className={`bg-gray-800/50 border border-gray-700 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Reviewer Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-brand-red to-brand-blue rounded-full flex items-center justify-center text-white font-bold">
            {review.reviewer?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">
                @{review.reviewer?.username || 'Anonymous'}
              </span>
              {review.type === 'seller_review' && (
                <Badge variant="outline" className="text-xs">
                  Verified Buyer
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-gray-400 text-xs">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onReport && (
            <button
              onClick={() => setShowReportForm(!showReportForm)}
              className="text-gray-400 hover:text-red-400 text-xs transition-colors"
            >
              Report
            </button>
          )}
        </div>
      </div>

      {/* Product Info (if showProduct) */}
      {showProduct && review.product && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-700/30 rounded">
          {review.product.image && (
            <div className="w-8 h-8 relative rounded overflow-hidden">
              <Image
                src={review.product.image}
                alt={review.product.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <span className="text-gray-300 text-sm">
            {review.product.title}
          </span>
        </div>
      )}

      {/* Review Content */}
      <p className="text-gray-300 text-sm leading-relaxed mb-3">
        {review.content}
      </p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.images.slice(0, 3).map((image, index) => (
            <div key={index} className="w-16 h-16 relative rounded overflow-hidden">
              <Image
                src={image}
                alt={`Review image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
          {review.images.length > 3 && (
            <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center text-gray-400 text-xs">
              +{review.images.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Report Form */}
      {showReportForm && (
        <div className="border-t border-gray-700 pt-3 mt-3">
          <h4 className="text-white text-sm font-medium mb-2">Report Review</h4>
          
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm mb-2"
          >
            <option value="">Select reason</option>
            <option value="inappropriate">Inappropriate content</option>
            <option value="spam">Spam</option>
            <option value="fake">Fake review</option>
            <option value="offensive">Offensive language</option>
            <option value="other">Other</option>
          </select>

          <textarea
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            placeholder="Describe the issue..."
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm mb-2 resize-none"
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowReportForm(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleReport}
              disabled={!reportReason || !reportDescription || isSubmittingReport}
            >
              {isSubmittingReport ? 'Reporting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      )}

      {/* Review Status (for admin/moderation) */}
      {review.status !== 'active' && (
        <div className="border-t border-gray-700 pt-2 mt-3">
          <Badge 
            variant={review.status === 'hidden' ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {review.status.toUpperCase()}
          </Badge>
        </div>
      )}
    </div>
  )
}