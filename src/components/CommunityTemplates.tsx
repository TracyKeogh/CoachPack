import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Clock, Download, Share2, Tag, CheckCircle, X, ArrowLeft, Info } from 'lucide-react';
import { useTemplates } from '../hooks/useTemplates';
import { GoalTemplate } from '../types/templates';
import { Link } from 'react-router-dom';

interface TemplateCardProps {
  template: GoalTemplate;
  onImport: (template: GoalTemplate) => void;
  isImported: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onImport, isImported }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'body': return 'bg-green-100 text-green-800 border-green-200';
      case 'balance': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business': return '💼';
      case 'body': return '💪';
      case 'balance': return '⚖️';
      default: return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getCategoryIcon(template.category)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
              {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Download className="w-3 h-3" />
            <span>{template.usageCount}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{template.title}</h3>
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{template.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <div className="flex items-center space-x-1">
              <span className="font-medium">{template.milestones.length}</span>
              <span>milestones</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">{template.actions.length}</span>
              <span>actions</span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {formatDate(template.createdAt)}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
              +{template.tags.length - 3} more
            </span>
          )}
        </div>
        
        <button
          onClick={() => onImport(template)}
          disabled={isImported}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isImported 
              ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isImported ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Imported</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Use This Template</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

interface TemplatePreviewModalProps {
  template: GoalTemplate | null;
  onClose: () => void;
  onConfirmImport: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({ template, onClose, onConfirmImport }) => {
  if (!template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Template Preview</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">
                  {template.category === 'business' ? '💼' : 
                   template.category === 'body' ? '💪' : '⚖️'}
                </span>
                <h3 className="text-xl font-semibold text-slate-900">{template.title}</h3>
              </div>
              <p className="text-slate-600">{template.description}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                <span>Milestones</span>
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                  {template.milestones.length} total
                </span>
              </h4>
              <div className="space-y-2">
                {template.milestones.map((milestone, index) => (
                  <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="font-medium text-amber-900">{milestone.title}</div>
                    {milestone.description && (
                      <div className="text-sm text-amber-700 mt-1">{milestone.description}</div>
                    )}
                    <div className="text-xs text-amber-600 mt-2">
                      Target: {new Date(milestone.targetDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                <span>Actions</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {template.actions.length} total
                </span>
              </h4>
              <div className="space-y-2">
                {template.actions.map((action, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-900">{action.title}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      Frequency: {action.frequency === 'daily' ? 'Daily' : 
                                 action.frequency === 'weekly' ? 'Weekly' : 
                                 '3x per Week'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-purple-800">
                    Importing this template will create a new goal with these milestones and actions. 
                    You can customize it after importing.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmImport}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Import Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommunityTemplates: React.FC = () => {
  const {
    communityTemplates,
    isLoaded,
    error,
    importTemplate,
    hasSharedTemplate,
    hasImportedTemplate,
    getTemplatesByCategory,
    searchTemplates,
    sortTemplates,
    userSharedCount
  } = useTemplates();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'usage'>('popular');
  const [filteredTemplates, setFilteredTemplates] = useState<GoalTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [showAccessMessage, setShowAccessMessage] = useState(false);

  // Filter templates based on category, search, and sort
  useEffect(() => {
    if (!isLoaded) return;

    let filtered = communityTemplates;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = getTemplatesByCategory(selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchTemplates(searchQuery);
    }
    
    // Apply sorting
    filtered = sortTemplates(filtered, sortBy);
    
    setFilteredTemplates(filtered);
  }, [communityTemplates, selectedCategory, searchQuery, sortBy, isLoaded, getTemplatesByCategory, searchTemplates, sortTemplates]);

  const handleImportClick = (template: GoalTemplate) => {
    if (!hasSharedTemplate()) {
      setShowAccessMessage(true);
      return;
    }
    
    setSelectedTemplate(template);
  };

  const handleConfirmImport = () => {
    if (selectedTemplate) {
      importTemplate(selectedTemplate.id);
      setSelectedTemplate(null);
    }
  };

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'business', name: 'Business & Career', icon: '💼', color: 'text-purple-600 border-purple-300' },
    { id: 'body', name: 'Health & Body', icon: '💪', color: 'text-green-600 border-green-300' },
    { id: 'balance', name: 'Life Balance', icon: '⚖️', color: 'text-blue-600 border-blue-300' }
  ];

  const sortOptions = [
    { id: 'popular', name: 'Most Popular', icon: TrendingUp },
    { id: 'recent', name: 'Most Recent', icon: Clock },
    { id: 'usage', name: 'Recommended', icon: CheckCircle }
  ];

  // Early return if not loaded yet
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Community Templates...</h2>
          <p className="text-slate-600">Discovering templates from the community</p>
        </div>
      </div>
    );
  }

  // Show access message if user hasn't shared any templates
  if (showAccessMessage) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/goals"
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Goals</span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Community Templates</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Share2 className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Share to Access Community Templates</h2>
          <p className="text-slate-600 mb-6">
            To access the community templates library, please share at least one of your goals as a template first.
            This helps our community grow with diverse and valuable content.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-amber-800 mb-2">How to share a goal:</h3>
            <ol className="list-decimal list-inside text-amber-700 space-y-1">
              <li>Go to the Goals page</li>
              <li>Select any goal you've created</li>
              <li>Toggle the "Share as Template" switch</li>
              <li>Your goal will be anonymized and shared with the community</li>
            </ol>
          </div>
          <Link
            to="/goals"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            <span>Go to Goals</span>
            <ArrowLeft className="w-4 h-4 transform rotate-180" />
          </Link>
          <button
            onClick={() => setShowAccessMessage(false)}
            className="block mx-auto mt-4 text-slate-500 hover:text-slate-700"
          >
            View templates anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Community Templates</h1>
         <div className="flex items-center mt-2">
           <p className="text-slate-600">
             Discover and use goal templates shared by the community
           </p>
           {userSharedCount > 0 && (
             <p className="text-sm text-green-600 ml-4 flex items-center">
               <Share2 className="w-4 h-4 mr-1" />
               You've shared {userSharedCount} template{userSharedCount !== 1 ? 's' : ''}
             </p>
           )}
         </div>
        </div>
        <Link
          to="/goals"
          className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Goals</span>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by title, description, or tags..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                className="flex items-center space-x-2 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Filter className="w-5 h-5 text-slate-500" />
                <span className="text-slate-700">Sort By</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id as 'popular' | 'recent' | 'usage')}
                      className={`flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors ${
                        sortBy === option.id ? 'bg-purple-50 text-purple-700' : 'text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.name}</span>
                      {sortBy === option.id && (
                        <CheckCircle className="w-4 h-4 ml-auto text-purple-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto pb-2 space-x-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {category.icon && <span className="text-lg">{category.icon}</span>}
            <span>{category.name}</span>
            {category.id !== 'all' && (
              <span className="px-2 py-0.5 bg-white rounded-full text-xs font-medium">
                {getTemplatesByCategory(category.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onImport={handleImportClick}
              isImported={hasImportedTemplate(template.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No templates found</h3>
          <p className="text-slate-600 mb-4">
            {searchQuery
              ? `No templates match your search for "${searchQuery}"`
              : `No templates found in the ${selectedCategory === 'all' ? 'selected categories' : selectedCategory} category`}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onConfirmImport={handleConfirmImport}
        />
      )}
    </div>
  );
};

export default CommunityTemplates;