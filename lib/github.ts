export class GitHubClient {
  private token: string
  private owner: string
  private templateRepo: string

  constructor(userToken?: string) {
    // Use user token from session if available, otherwise use server token
    this.token = userToken || process.env.GITHUB_TOKEN!
    this.owner = process.env.GITHUB_OWNER!
    this.templateRepo = process.env.GITHUB_TEMPLATE_REPO!
  }

  async createRepository(name: string, description?: string) {
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        private: false,
        auto_init: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create repository: ${response.statusText}`)
    }

    return response.json()
  }

  async createFromTemplate(name: string, description?: string) {
    const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.templateRepo}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        owner: this.owner,
        name,
        description,
        private: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create repository from template: ${response.statusText}`)
    }

    return response.json()
  }

  async writeFile(repo: string, path: string, content: string, message: string) {
    const response = await fetch(`https://api.github.com/repos/${this.owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString('base64'),
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to write file: ${response.statusText}`)
    }

    return response.json()
  }

  async getUserRepositories(username?: string) {
    const user = username || this.owner
    const response = await fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=100`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories: ${response.statusText}`)
    }

    return response.json()
  }

  async getRepository(owner: string, repo: string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch repository: ${response.statusText}`)
    }

    return response.json()
  }

  async writeMultipleFiles(repo: string, files: Array<{path: string, content: string, message: string}>) {
    const results = []
    
    for (const file of files) {
      try {
        const result = await this.writeFile(repo, file.path, file.content, file.message)
        results.push({ path: file.path, ok: true, result })
      } catch (error) {
        results.push({ path: file.path, ok: false, error: error.message })
      }
    }
    
    return results
  }
}
