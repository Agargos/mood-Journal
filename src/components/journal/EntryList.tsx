import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJournalEntries, JournalEntry } from '@/hooks/useJournalEntries';
import { Clock, FileText, Filter, X } from 'lucide-react';

export const EntryList = () => {
  const { entries, loading, getFilteredEntries, getAllTags } = useJournalEntries();
  const [selectedTag, setSelectedTag] = useState<string>('all');
  
  const filteredEntries = getFilteredEntries(selectedTag === 'all' ? undefined : selectedTag);
  const availableTags = getAllTags();

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case 'POSITIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'NEGATIVE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Journal History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!entries.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Journal History
          </CardTitle>
          <CardDescription>
            Your journal entries will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No journal entries yet</p>
            <p className="text-sm">Start writing to see your entries here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Journal History ({filteredEntries.length})
        </CardTitle>
        <CardDescription>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} total
          {selectedTag && selectedTag !== 'all' && ` • Filtered by "${selectedTag}"`}
        </CardDescription>
        {availableTags.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entries</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTag && selectedTag !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTag('all')}
                className="h-8 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] lg:max-h-[600px] overflow-y-auto">
          {filteredEntries.map((entry: JournalEntry) => (
            <div key={entry.id} className="border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </span>
                    {entry.sentiment && (
                      <Badge className={getSentimentColor(entry.sentiment)}>
                        {entry.sentiment.toLowerCase()}
                      </Badge>
                    )}
                    {entry.score && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {(entry.score * 100).toFixed(0)}% confidence
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base line-clamp-3">
                    {entry.text.length > 150 
                      ? entry.text.substring(0, 150) + '...'
                      : entry.text
                    }
                  </p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {entry.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{entry.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredEntries.length === 0 && selectedTag && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No entries found with tag "{selectedTag}"
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};