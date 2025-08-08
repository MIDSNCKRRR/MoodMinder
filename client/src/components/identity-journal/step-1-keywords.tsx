import { useState, useEffect } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Step1KeywordsProps {
  selectedKeywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  onNext: () => void;
}

export default function Step1Keywords({ selectedKeywords, onKeywordsChange, onNext }: Step1KeywordsProps) {
  const candidateWords = [
    // Personal Qualities
    "Creative", "Analytical", "Empathetic", "Curious", "Resilient",
    "Adventurous", "Calm", "Energetic", "Patient", "Spontaneous",
    "Organized", "Flexible", "Optimistic", "Realistic", "Intuitive",
    
    // Values & Beliefs
    "Authentic", "Honest", "Loyal", "Independent", "Collaborative",
    "Compassionate", "Ambitious", "Humble", "Confident", "Mindful",
    "Progressive", "Traditional", "Spiritual", "Rational", "Idealistic",
    
    // Roles & Identities
    "Leader", "Supporter", "Teacher", "Learner", "Creator",
    "Protector", "Innovator", "Peacemaker", "Challenger", "Nurturer",
    "Explorer", "Builder", "Healer", "Storyteller", "Connector",
    
    // Growth & Change
    "Growing", "Transforming", "Discovering", "Healing", "Evolving",
    "Searching", "Becoming", "Questioning", "Accepting", "Releasing",
    "Embracing", "Expanding", "Deepening", "Awakening", "Integrating"
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredWords, setFilteredWords] = useState(candidateWords);

  // Filter words based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredWords(candidateWords);
    } else {
      setFilteredWords(
        candidateWords.filter(word =>
          word.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm]);

  // Auto-save keywords
  useEffect(() => {
    localStorage.setItem('identityJournal_keywords', JSON.stringify(selectedKeywords));
  }, [selectedKeywords]);

  const handleKeywordToggle = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      onKeywordsChange(selectedKeywords.filter(k => k !== keyword));
    } else {
      onKeywordsChange([...selectedKeywords, keyword]);
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onKeywordsChange(selectedKeywords.filter(k => k !== keyword));
  };

  const isSelected = (keyword: string) => selectedKeywords.includes(keyword);
  const canProceed = selectedKeywords.length > 0;

  return (
    <div className="space-y-6">
      {/* Step Content */}
      <Card 
        className="rounded-organic stone-shadow border-0"
        style={{ background: 'linear-gradient(135deg, hsl(140, 35%, 93%) 0%, hsl(140, 30%, 85%) 100%)' }}
      >
        <CardContent className="p-6">
          <h3 className="font-serif font-semibold text-stone-600 text-xl mb-2 text-center">
            Choose words that reflect who you are today
          </h3>
          <p className="text-stone-500 text-sm text-center mb-6">
            Select keywords that resonate with your current sense of self
          </p>
          
          {/* Search Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search for words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-stone border border-sage-200 bg-white/80 text-stone-600 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent"
              data-testid="keyword-search"
            />
          </div>

          {/* Selected Keywords */}
          {selectedKeywords.length > 0 && (
            <div className="mb-6 p-4 bg-white/60 rounded-stone border border-sage-200">
              <h4 className="text-sm font-medium text-stone-600 mb-3">
                Selected ({selectedKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedKeywords.map((keyword) => (
                  <div
                    key={keyword}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-sage-200 text-sage-700 rounded-full text-sm font-medium"
                    data-testid={`selected-keyword-${keyword.toLowerCase()}`}
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1 text-sage-500 hover:text-sage-700 transition-colors"
                      data-testid={`remove-keyword-${keyword.toLowerCase()}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords Grid */}
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredWords.map((keyword) => (
              <Button
                key={keyword}
                onClick={() => handleKeywordToggle(keyword)}
                variant="outline"
                size="sm"
                className={`
                  p-3 h-auto rounded-stone text-sm font-medium transition-all duration-200
                  ${isSelected(keyword)
                    ? "bg-sage-200 border-sage-300 text-sage-700 scale-95"
                    : "bg-white/60 border-sage-200 text-stone-600 hover:bg-sage-50 hover:border-sage-300"
                  }
                `}
                data-testid={`keyword-${keyword.toLowerCase()}`}
              >
                <div className="flex items-center gap-2">
                  {isSelected(keyword) && (
                    <div className="w-2 h-2 bg-sage-500 rounded-full" />
                  )}
                  <span>{keyword}</span>
                </div>
              </Button>
            ))}
          </div>

          {filteredWords.length === 0 && (
            <div className="text-center py-8 text-stone-500">
              <p>No words found matching "{searchTerm}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Button */}
      <div className="flex justify-center">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
          className="rounded-stone px-8 bg-sage-500 hover:bg-sage-600 text-white disabled:bg-stone-300 disabled:text-stone-500"
          data-testid="next-button"
        >
          Continue to Reflection
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}