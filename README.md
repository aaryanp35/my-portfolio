# Aaryan Patel - Portfolio Website

A modern, responsive portfolio website showcasing projects, skills, and contact information.

## Features

✨ **Modern Design**
- Clean and professional UI
- Smooth animations and transitions
- Gradient accents and modern color scheme

📱 **Fully Responsive**
- Mobile-first design approach
- Works seamlessly on all devices
- Hamburger menu for mobile navigation

🎯 **Key Sections**
- **Hero Section**: Eye-catching introduction with call-to-action buttons
- **About Section**: Personal information and background
- **Projects Section**: Showcase of 6 featured projects with hover effects
- **Skills Section**: Organized skills by category (Frontend, Backend, Tools, Other)
- **Contact Section**: Working contact form with validation

🚀 **Interactive Features**
- Smooth scrolling navigation
- Active navigation highlighting
- Form validation with real-time feedback
- Scroll animations
- Social media links
- Mobile menu toggle

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript**: Interactive functionality
- **Font Awesome**: Icon library

## File Structure

```
my-portfolio/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── script.js           # JavaScript functionality
├── images/             # Project images folder
│   ├── project1.jpg
│   ├── project2.jpg
│   ├── project3.jpg
│   ├── project4.jpg
│   ├── project5.jpg
│   └── project6.jpg
└── README.md           # This file
```

## Getting Started

1. **Clone or download** this repository
2. **Add your project images** to the `images/` folder
3. **Customize the content**:
   - Update personal information in `index.html`
   - Modify colors in CSS variables in `styles.css`
   - Add your social media links
   - Replace project details with your own work
4. **Open `index.html`** in a web browser

## Customization Guide

### Changing Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #6366f1;     /* Main brand color */
    --secondary-color: #8b5cf6;   /* Secondary accent */
    --accent-color: #ec4899;      /* Accent highlights */
    /* ... more variables ... */
}
```

### Adding Your Projects

In `index.html`, find the projects section and update each project card:

```html
<div class="project-card">
    <div class="project-image">
        <img src="images/your-project.jpg" alt="Your Project Name">
        <div class="project-overlay">
            <a href="https://your-project-live-link.com" class="project-link">
                <i class="fas fa-external-link-alt"></i>
            </a>
            <a href="https://github.com/yourusername/project" class="project-link">
                <i class="fab fa-github"></i>
            </a>
        </div>
    </div>
    <div class="project-content">
        <h3>Your Project Name</h3>
        <p>Description of your project...</p>
        <div class="project-tags">
            <span class="tag">Tech1</span>
            <span class="tag">Tech2</span>
        </div>
    </div>
</div>
```

### Updating Contact Information

1. Replace email addresses and phone numbers in `index.html`
2. Update social media links (GitHub, LinkedIn, Twitter, etc.)
3. Modify the contact form submission in `script.js` to connect to your backend

### Form Submission

The contact form currently simulates a submission. To make it functional:

1. Create a backend API endpoint
2. Update the form submission in `script.js`:

```javascript
// Replace the simulated API call with your actual endpoint
const response = await fetch('https://your-api.com/contact', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance Features

- Lazy loading for images
- Optimized animations
- Minimal JavaScript bundle
- CSS optimization

## Optional Enhancements

The code includes optional features that are commented out:
- Typing effect for hero subtitle
- Scroll to top button
- Character counter for message field

To enable these, uncomment the relevant code in `script.js`.

## Deployment

This website can be deployed to:
- **GitHub Pages**: Free hosting for static sites
- **Netlify**: Easy deployment with continuous integration
- **Vercel**: Fast deployment with great performance
- **Traditional hosting**: Upload files via FTP

### Deploying to GitHub Pages

1. Create a GitHub repository
2. Push your code to the repository
3. Go to Settings > Pages
4. Select your branch and save
5. Your site will be live at `https://yourusername.github.io/repository-name`

## License

This project is open source and available for personal and commercial use.

## Contact

For questions or suggestions, feel free to reach out:
- Email: contact@aaryanpatel.com
- GitHub: [Your GitHub]
- LinkedIn: [Your LinkedIn]

---

**Built with ❤️ by Aaryan Patel**
