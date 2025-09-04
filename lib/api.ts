const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (() => {
  if (typeof window === 'undefined') return 'http://192.168.1.200:8000/api';
  
  // Use HTTP for both localhost and network access
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000/api';
  }
  
  // For network access, use HTTP
  return 'http://192.168.1.200:8000/api';
})();

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  age: number;
  date_of_birth: string;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'None';
  why_study_japanese: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  profile_picture: string | null;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  date_of_birth: string;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'None';
  why_study_japanese: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  age?: number;
  date_of_birth?: string;
  jlpt_level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'None';
  why_study_japanese?: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token found and added to headers');
    } else {
      console.log('⚠️ No token found');
    }

    console.log('🌐 Making API request to:', url);
    console.log('📋 Request options:', { method: options.method || 'GET', headers });
    console.log('📦 Request body:', options.body);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('📡 Response URL:', response.url);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Expected JSON response but received:', contentType);
        throw new Error('Expected JSON response but received HTML');
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.error) {
            throw new Error(data.error);
          }
          throw new Error(data.message || 'API request failed');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📄 Response data:', data);

      // Laravel returns data directly, not wrapped in a data property
      return data;
    } catch (error) {
      // Don't log 404 errors for deck not found as they're expected when decks are deleted
      if (!(error instanceof Error && error.message.includes('Deck not found'))) {
        console.error('❌ API request failed:', error);
        console.error('🌐 Failed URL:', url);
      }
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.setToken(response.token);
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setToken(response.token);
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.log('Database logout failed, using local logout');
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<any> {
    const response = await this.request('/user');
    return response;
  }

  async checkAuth(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  // Deck Management Methods
  async getDecks(): Promise<any> {
    const response = await this.request('/jlpt/decks');
    console.log('🔍 getDecks() response:', response);
    return response;
  }

  async getDeck(slug: string): Promise<any> {
    return await this.request(`/jlpt/decks/${slug}`);
  }

  async getDecksByCategory(category: string): Promise<any> {
    return await this.request(`/jlpt/decks/category/${category}`);
  }

  async createDeck(deckData: {
    name: string;
    description?: string;
    category?: 'user' | 'kana' | 'group' | 'jlpt';
    jlpt_level?: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
    is_active?: boolean;
  }): Promise<any> {
    try {
      return await this.request('/jlpt/decks', {
        method: 'POST',
        body: JSON.stringify(deckData),
      });
    } catch (error) {
      // Check if this is a reserved name error from the backend
      if (error instanceof Error && 
          error.message.toLowerCase().includes('reserved')) {
        throw new Error('This name is reserved for JLPT core vocabulary decks. Please choose a different name.');
      }
      throw error;
    }
  }

  async updateDeck(id: number, deckData: {
    name?: string;
    description?: string;
    is_active?: boolean;
  }): Promise<any> {
    return await this.request(`/jlpt/decks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deckData),
    });
  }

  async deleteDeck(id: number): Promise<any> {
    return await this.request(`/jlpt/decks/${id}`, {
      method: 'DELETE',
    });
  }

  // Word Management Methods
  async addWordToDeck(wordData: {
    deck_slug: string;
    japanese: string;
    reading?: string;
    english: string;
    jlpt_level?: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
    part_of_speech?: string;
    example_sentence?: string;
  }): Promise<any> {
    return await this.request('/jlpt/decks/add-word', {
      method: 'POST',
      body: JSON.stringify(wordData),
    });
  }

  // AI-assisted selection from DB for a deck
  async selectWordsForDeck(params: {
    deck_slug: string;
    deck_title: string;
    num: number;
  }): Promise<any> {
    return await this.request('/jlpt/decks/select-words', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async removeWordFromDeck(deckSlug: string, wordId: number): Promise<any> {
    return await this.request('/jlpt/decks/remove-word', {
      method: 'DELETE',
      body: JSON.stringify({
        deck_slug: deckSlug,
        word_id: wordId,
      }),
    });
  }

  async updateWord(wordId: number, wordData: {
    japanese?: string;
    reading?: string;
    english?: string;
    jlpt_level?: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
    part_of_speech?: string;
    example_sentence?: string;
  }): Promise<any> {
    return await this.request(`/jlpt/words/${wordId}`, {
      method: 'PUT',
      body: JSON.stringify(wordData),
    });
  }

  async getWords(level?: string, search?: string): Promise<any> {
    const params = new URLSearchParams();
    if (level) params.append('jlpt_level', level);
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/jlpt/words?${queryString}` : '/jlpt/words';
    
    return await this.request(endpoint);
  }

  async searchWords(query: string): Promise<any> {
    return await this.request(`/jlpt/words/search?q=${encodeURIComponent(query)}`);
  }

  async getWordsByLevel(level: string): Promise<any> {
    return await this.request(`/jlpt/words/level/${level}`);
  }

  async getWord(id: number): Promise<any> {
    return await this.request(`/jlpt/words/${id}`);
  }

  // User Stats Methods
  async getUserStats(): Promise<any> {
    return await this.request('/stats');
  }

  // Admin User Management methods
  async getAllUsers(): Promise<any> {
    return await this.request('/admin/users');
  }

  async getAdminStats(): Promise<any> {
    return await this.request('/admin/stats');
  }

  async updateUserPassword(userId: string, password: string): Promise<any> {
    return await this.request(`/admin/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password })
    });
  }

  async sendPasswordResetEmail(email: string): Promise<any> {
    return await this.request('/admin/users/send-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async getAdminUserStats(userId: string): Promise<any> {
    return await this.request(`/admin/users/${userId}/stats`);
  }

  // Admin Profile Management Methods
  async getAdminUserProfile(userId: string): Promise<{ user: any; profile: UserProfile }> {
    return await this.request(`/admin/users/${userId}/profile`);
  }

  async updateAdminUserProfile(userId: string, profileData: UpdateProfileRequest): Promise<{ message: string; user: any; profile: UserProfile }> {
    return await this.request(`/admin/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Admin Deck Management Methods
  async getAdminDecks(showAllDecks: boolean = false): Promise<{ decks: any[] }> {
    const url = showAllDecks ? '/admin/deck-management/decks?all=true' : '/admin/deck-management/decks';
    return await this.request(url);
  }

  async createAdminDeck(deckData: { name: string; description?: string; category: string; is_public: boolean }): Promise<{ message: string; deck: any }> {
    return await this.request('/admin/deck-management/decks', {
      method: 'POST',
      body: JSON.stringify(deckData),
    });
  }

  async updateAdminDeck(deckId: string, deckData: { name: string; description?: string; category: string; is_public: boolean }): Promise<{ message: string; deck: any }> {
    return await this.request(`/admin/deck-management/decks/${deckId}`, {
      method: 'PUT',
      body: JSON.stringify(deckData),
    });
  }

  async deleteAdminDeck(deckId: string): Promise<{ message: string }> {
    return await this.request(`/admin/deck-management/decks/${deckId}`, {
      method: 'DELETE',
    });
  }

  async generateWordsForAdminDeck(deckId: string, numWords: number): Promise<any> {
    return await this.request(`/admin/deck-management/decks/${deckId}/generate-words`, {
      method: 'POST',
      body: JSON.stringify({ num: numWords }),
    });
  }

  async selectWordsForAdminDeck(params: {
    deck_slug: string;
    deck_title: string;
    num: number;
  }): Promise<any> {
    // For admin decks, we'll use the generate words endpoint but format it like the user endpoint
    const deckId = params.deck_slug; // In admin context, deck_slug is actually the deck ID
    const response = await this.generateWordsForAdminDeck(deckId, params.num);
    
    // Format the response to match what VocabularyForm expects
    return {
      words: response.words || [],
      exhausted: response.exhausted || false,
      total_available: response.total_available || 0,
      constraints_exhausted: response.constraints_exhausted || false,
    };
  }

  async addWordsToAdminDeck(deckId: string, words: any[]): Promise<any> {
    return await this.request(`/admin/deck-management/decks/${deckId}/add-words`, {
      method: 'POST',
      body: JSON.stringify({ words }),
    });
  }

  async getAdminDeckWords(deckId: string): Promise<any> {
    return await this.request(`/admin/deck-management/decks/${deckId}/words`);
  }

  // Group Management Methods
  async getAllGroups(): Promise<any> {
    return await this.request('/admin/groups');
  }

  async createGroup(groupData: {
    name: string;
    description?: string;
  }): Promise<any> {
    return await this.request('/admin/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async getGroupDetails(groupId: string): Promise<any> {
    return await this.request(`/admin/groups/${groupId}`);
  }

  async updateGroup(groupId: string, groupData: {
    name: string;
    description?: string;
  }): Promise<any> {
    return await this.request(`/admin/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(groupData),
    });
  }

  async deleteGroup(groupId: string): Promise<any> {
    return await this.request(`/admin/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  async getAvailableUsers(groupId?: string): Promise<any> {
    const endpoint = groupId 
      ? `/admin/groups/${groupId}/available-users`
      : '/admin/available-users';
    return await this.request(endpoint);
  }

  async addUsersToGroup(groupId: string, userIds: string[]): Promise<any> {
    return await this.request(`/admin/groups/${groupId}/add-users`, {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds }),
    });
  }

  async removeUsersFromGroup(groupId: string, userIds: string[]): Promise<any> {
    return await this.request(`/admin/groups/${groupId}/remove-users`, {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds }),
    });
  }

  async getStatsByContentType(contentType: string): Promise<any> {
    return await this.request(`/stats/${contentType}`);
  }

  async updateMemoryStats(contentType: string, score: number, total: number): Promise<any> {
    return await this.request('/stats/memory', {
      method: 'POST',
      body: JSON.stringify({ content_type: contentType, score, total }),
    });
  }

  async updatePronunciationStats(contentType: string, score: number, total: number): Promise<any> {
    return await this.request('/stats/pronunciation', {
      method: 'POST',
      body: JSON.stringify({ content_type: contentType, score, total }),
    });
  }

  async updateListeningStats(contentType: string, score: number, total: number): Promise<any> {
    return await this.request('/stats/listening', {
      method: 'POST',
      body: JSON.stringify({ content_type: contentType, score, total }),
    });
  }

  async updateKanaStats(contentType: string, score: number, total: number): Promise<any> {
    return await this.request('/stats/kana', {
      method: 'POST',
      body: JSON.stringify({ content_type: contentType, score, total }),
    });
  }

  async updateViewWordsCount(contentType: string, count: number = 1): Promise<any> {
    return await this.request('/stats/view-words', {
      method: 'POST',
      body: JSON.stringify({ content_type: contentType, count }),
    });
  }

  async updateWordMasteryStats(contentType: string, masteryStats: Record<string, any>): Promise<any> {
    return await this.request('/stats/word-mastery', {
      method: 'POST',
      body: JSON.stringify({ content_type: contentType, mastery_stats: masteryStats }),
    });
  }

  async updateQuizResults(contentType: string, type: 'provided' | 'ai', results: any[]): Promise<any> {
    return await this.request('/stats/quiz-results', {
      method: 'POST',
      body: JSON.stringify({ content_type: contentType, type, results }),
    });
  }

  async updateQuizHighscores(contentType: string, highscores: Record<string, number>): Promise<any> {
    return await this.request('/stats/quiz-highscores', {
      method: 'POST',
      body: JSON.stringify({ content_type: contentType, highscores }),
    });
  }

  async updateCompletedLessons(contentType: string, lessons: string[]): Promise<any> {
    return await this.request('/stats/completed-lessons', {
      method: 'POST',
      body: JSON.stringify({ content_type: contentType, lessons }),
    });
  }

  async updateDeckProgress(contentType: string, progress: Record<string, any>): Promise<any> {
    return await this.request('/stats/deck-progress', {
      method: 'POST',
      body: JSON.stringify({ content_type: contentType, progress }),
    });
  }

  async resetStats(contentType: string): Promise<any> {
    return await this.request('/stats/reset', {
      method: 'POST',
      body: JSON.stringify({ content_type: contentType }),
    });
  }

  async resetAllStats(): Promise<any> {
    return await this.request('/stats/reset-all', {
      method: 'POST',
    });
  }

  // Kana Methods
  async getAllKana(type?: string, category?: string): Promise<any> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (category) params.append('category', category);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/kana?${queryString}` : '/kana';
    
    return await this.request(endpoint);
  }

  async getHiragana(category?: string): Promise<any> {
    const endpoint = category ? `/kana/hiragana?category=${category}` : '/kana/hiragana';
    return await this.request(endpoint);
  }

  async getKatakana(category?: string): Promise<any> {
    const endpoint = category ? `/kana/katakana?category=${category}` : '/kana/katakana';
    return await this.request(endpoint);
  }

  async getKanaByCategory(category: string): Promise<any> {
    return await this.request(`/kana/category/${category}`);
  }

  async getRandomKana(count: number = 10, type?: string, category?: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('count', count.toString());
    if (type) params.append('type', type);
    if (category) params.append('category', category);
    
    return await this.request(`/kana/random?${params.toString()}`);
  }

  async getKanaStats(): Promise<any> {
    return await this.request('/kana/stats');
  }

  // Profile Methods
  async getProfile(): Promise<{ profile: UserProfile }> {
    return await this.request('/profile');
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<{ message: string; profile: UserProfile }> {
    return await this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadProfilePicture(file: File): Promise<{ message: string; profile_picture_url: string; profile: UserProfile }> {
    const formData = new FormData();
    formData.append('profile_picture', file);

    return await this.request('/profile/upload-picture', {
      method: 'POST',
      headers: {}, // Let the browser set the Content-Type for FormData
      body: formData,
    });
  }

  async deleteProfilePicture(): Promise<{ message: string; profile: UserProfile }> {
    return await this.request('/profile/picture', {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService(); 