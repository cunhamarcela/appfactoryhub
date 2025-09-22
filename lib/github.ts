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
    // If no username provided, get authenticated user's repos
    const endpoint = username 
      ? `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
      : `https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner`
    
    console.log('GitHubClient: Making request to:', endpoint)
    console.log('GitHubClient: Token available:', this.token ? 'Yes' : 'No')
    
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    console.log('GitHubClient: Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('GitHubClient: Error response:', errorText)
      throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('GitHubClient: Successfully fetched', data.length, 'repositories')
    return data
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
        results.push({ 
          path: file.path, 
          ok: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return results
  }

  async detectTechStack(owner: string, repo: string): Promise<string> {
    try {
      // Check for common files that indicate tech stack
      const filesToCheck = [
        'pubspec.yaml', // Flutter
        'package.json', // React Native/Node.js
        'android/app/build.gradle', // Android
        'ios/Podfile', // iOS
        'firebase.json', // Firebase
        'supabase/config.toml', // Supabase
        '.firebaserc' // Firebase
      ]

      const fileChecks = await Promise.allSettled(
        filesToCheck.map(async (file) => {
          const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          })
          return { file, exists: response.ok }
        })
      )

      const existingFiles = fileChecks
        .filter((result): result is PromiseFulfilledResult<{file: string, exists: boolean}> => 
          result.status === 'fulfilled' && result.value.exists
        )
        .map(result => result.value.file)

      // Determine stack based on existing files
      if (existingFiles.includes('pubspec.yaml')) {
        // Check if it's using Firebase or Supabase
        if (existingFiles.includes('firebase.json') || existingFiles.includes('.firebaserc')) {
          return 'firebase'
        } else if (existingFiles.includes('supabase/config.toml')) {
          return 'supabase'
        }
        // Default to firebase for Flutter projects
        return 'firebase'
      }

      // For React Native projects
      if (existingFiles.includes('package.json')) {
        // Try to read package.json to check dependencies
        try {
          const packageResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          })
          
          if (packageResponse.ok) {
            const packageData = await packageResponse.json()
            const packageContent = JSON.parse(Buffer.from(packageData.content, 'base64').toString())
            
            const dependencies = {
              ...packageContent.dependencies,
              ...packageContent.devDependencies
            }
            
            if (dependencies['@supabase/supabase-js'] || dependencies['supabase']) {
              return 'supabase'
            } else if (dependencies['firebase'] || dependencies['@react-native-firebase/app']) {
              return 'firebase'
            }
          }
        } catch (error) {
          console.warn('Could not read package.json:', error)
        }
      }

      // Default fallback
      return 'firebase'
    } catch (error) {
      console.warn('Error detecting tech stack:', error)
      return 'firebase' // Default fallback
    }
  }

  async getRepositoryLanguages(owner: string, repo: string) {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch repository languages: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.warn('Error fetching repository languages:', error)
      return {}
    }
  }

  async getRepositoryTree(owner: string, repo: string, ref = "main") {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${ref}?recursive=1`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch repository tree: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.warn('Error fetching repository tree:', error)
      return { tree: [] }
    }
  }
}

// Helper functions for the new addon features
export async function ghGenerateFromTemplate(owner: string, template: string, name: string, description?: string) {
  const token = process.env.GITHUB_TOKEN!;
  const res = await fetch(`https://api.github.com/repos/${owner}/${template}/generate`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json" },
    body: JSON.stringify({ owner, name, description: description ?? "Repo gerado pelo App Factory Hub", private: true })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { html_url, full_name, ... }
}

export async function ghWriteFiles(fullName: string, files: {path:string; content:string; message?:string}[]) {
  const token = process.env.GITHUB_TOKEN!;
  const results: {path:string; ok:boolean}[] = [];
  for (const f of files) {
    const res = await fetch(`https://api.github.com/repos/${fullName}/contents/${encodeURIComponent(f.path)}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json" },
      body: JSON.stringify({
        message: f.message ?? `chore: add ${f.path}`,
        content: Buffer.from(f.content, "utf-8").toString("base64")
      })
    });
    results.push({ path: f.path, ok: res.ok });
  }
  return results;
}

export async function ghGetLanguages(fullName: string) {
  const token = process.env.GITHUB_TOKEN!;
  const res = await fetch(`https://api.github.com/repos/${fullName}/languages`, {
    headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json" }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { Dart: 12345, ... }
}

export async function ghGetTree(fullName: string, ref = "main") {
  const token = process.env.GITHUB_TOKEN!;
  const res = await fetch(`https://api.github.com/repos/${fullName}/git/trees/${ref}?recursive=1`, {
    headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json" }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { tree: [{path, type}], ... }
}
