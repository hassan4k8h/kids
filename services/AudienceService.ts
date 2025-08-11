// Audience Service - Using Resend API
// Manage email audiences and contacts

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const RESEND_AUDIENCES_URL = 'https://api.resend.com/audiences';
const RESEND_CONTACTS_URL = 'https://api.resend.com/audiences';

export interface AudienceOptions {
  name: string;
}

export interface ContactOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
}

export interface AudienceResponse {
  id: string;
  object: string;
  name: string;
  createdAt: string;
}

export interface ContactResponse {
  id: string;
  object: string;
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed: boolean;
  createdAt: string;
}

export class AudienceService {
  /**
   * Create a new audience
   */
  static async createAudience(options: AudienceOptions): Promise<AudienceResponse | null> {
    try {
      const response = await fetch(RESEND_AUDIENCES_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: options.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Audience created successfully:', data.id);
        return data;
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to create audience: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to create audience:', error);
      return null;
    }
  }

  /**
   * Get an audience by ID
   */
  static async getAudience(audienceId: string): Promise<AudienceResponse | null> {
    try {
      const response = await fetch(`${RESEND_AUDIENCES_URL}/${audienceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Audience retrieved successfully:', data.id);
        return data;
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to retrieve audience: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to retrieve audience:', error);
      return null;
    }
  }

  /**
   * List all audiences
   */
  static async listAudiences(): Promise<AudienceResponse[] | null> {
    try {
      const response = await fetch(RESEND_AUDIENCES_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Audiences listed successfully:', data.data?.length || 0, 'audiences');
        return data.data || [];
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to list audiences: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to list audiences:', error);
      return null;
    }
  }

  /**
   * Delete an audience
   */
  static async deleteAudience(audienceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${RESEND_AUDIENCES_URL}/${audienceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Audience deleted successfully:', audienceId);
        return true;
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to delete audience: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to delete audience:', error);
      return false;
    }
  }

  /**
   * Add a contact to an audience
   */
  static async addContact(audienceId: string, contact: ContactOptions): Promise<ContactResponse | null> {
    try {
      const response = await fetch(`${RESEND_CONTACTS_URL}/${audienceId}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          unsubscribed: contact.unsubscribed || false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Contact added successfully:', data.id);
        return data;
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to add contact: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to add contact:', error);
      return null;
    }
  }

  /**
   * Get a contact from an audience
   */
  static async getContact(audienceId: string, contactId: string): Promise<ContactResponse | null> {
    try {
      const response = await fetch(`${RESEND_CONTACTS_URL}/${audienceId}/contacts/${contactId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Contact retrieved successfully:', data.id);
        return data;
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to retrieve contact: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to retrieve contact:', error);
      return null;
    }
  }

  /**
   * List all contacts in an audience
   */
  static async listContacts(audienceId: string): Promise<ContactResponse[] | null> {
    try {
      const response = await fetch(`${RESEND_CONTACTS_URL}/${audienceId}/contacts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Contacts listed successfully:', data.data?.length || 0, 'contacts');
        return data.data || [];
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to list contacts: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to list contacts:', error);
      return null;
    }
  }

  /**
   * Update a contact in an audience
   */
  static async updateContact(
    audienceId: string,
    contactId: string,
    updates: Partial<ContactOptions>
  ): Promise<ContactResponse | null> {
    try {
      const response = await fetch(`${RESEND_CONTACTS_URL}/${audienceId}/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Contact updated successfully:', data.id);
        return data;
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to update contact: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
      return null;
    }
  }

  /**
   * Remove a contact from an audience
   */
  static async removeContact(audienceId: string, contactId: string): Promise<boolean> {
    try {
      const response = await fetch(`${RESEND_CONTACTS_URL}/${audienceId}/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Contact removed successfully:', contactId);
        return true;
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to remove contact: ${errorData}`);
      }
    } catch (error) {
      console.error('Failed to remove contact:', error);
      return false;
    }
  }

  /**
   * Add multiple contacts to an audience at once
   */
  static async addMultipleContacts(
    audienceId: string,
    contacts: ContactOptions[]
  ): Promise<ContactResponse[]> {
    const results: ContactResponse[] = [];
    
    for (const contact of contacts) {
      const result = await this.addContact(audienceId, contact);
      if (result) {
        results.push(result);
      }
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Added ${results.length} out of ${contacts.length} contacts successfully`);
    return results;
  }

  /**
   * Subscribe a user to the main audience when they sign up
   */
  static async subscribeUser(email: string, firstName?: string, lastName?: string): Promise<boolean> {
    try {
      // First, try to get or create the main audience
      let mainAudience = await this.getMainAudience();
      
      if (!mainAudience) {
        mainAudience = await this.createAudience({ name: 'Kids Educational Game Users' });
      }
      
      if (!mainAudience) {
        throw new Error('Failed to create or get main audience');
      }
      
      // Add the user to the main audience
      const contact = await this.addContact(mainAudience.id, {
        email,
        firstName,
        lastName,
        unsubscribed: false
      });
      
      return contact !== null;
    } catch (error) {
      console.error('Failed to subscribe user:', error);
      return false;
    }
  }

  /**
   * Get the main audience (or create it if it doesn't exist)
   */
  static async getMainAudience(): Promise<AudienceResponse | null> {
    try {
      const audiences = await this.listAudiences();
      if (audiences) {
        // Look for the main audience
        const mainAudience = audiences.find(audience => 
          audience.name === 'Kids Educational Game Users'
        );
        return mainAudience || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get main audience:', error);
      return null;
    }
  }
}

export default AudienceService;