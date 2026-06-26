'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Users, DollarSign, PlusCircle, Edit3, Trash2, 
  X, Check, AlertCircle, ShoppingBag, Send, BookOpen, Layers, 
  PlayCircle, HelpCircle, Mail, Key, Gift, Eye, MessageSquare, CheckSquare, Trash, Clock, Menu, ChevronDown, ArrowUp, ArrowDown,
  Layout, Star, LogOut,
  GraduationCap, Award, Calculator, Compass, Languages, Cpu, Sparkles, PenTool, History, FlaskConical, Globe,
  LayoutGrid, List
} from 'lucide-react';
import Link from 'next/link';
import { turkeyCities } from '@/data/turkeyDb';

export default function AdminDashboard() {
  // Data lists
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Navigation
  const [activeSection, setActiveSection] = useState('products'); // products, orders, users, coupons, messages, grant
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Custom Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    resolveRef: null,
    type: 'warning' // 'warning' or 'danger'
  });

  const showConfirm = (message, title = 'Onay Gerekli', type = 'warning') => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        resolveRef: resolve,
        type
      });
    });
  };

  const handleConfirmClose = (result) => {
    if (confirmDialog.resolveRef) {
      confirmDialog.resolveRef(result);
    }
    setConfirmDialog({
      isOpen: false,
      title: '',
      message: '',
      resolveRef: null,
      type: 'warning'
    });
  };
  
  // Feedback states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Current Logged-in admin data
  const [currentAdminId, setCurrentAdminId] = useState(null);

  // Product Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [type, setType] = useState('Video Ders Seti');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [contents, setContents] = useState([]);
  const [outcomesInput, setOutcomesInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [pages, setPages] = useState('');
  const [videoCount, setVideoCount] = useState('');
  const [duration, setDuration] = useState('');
  const [examCount, setExamCount] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [showDemo, setShowDemo] = useState(true);
  const [demoUrl, setDemoUrl] = useState('');
  const [showFaq, setShowFaq] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [showOutcomes, setShowOutcomes] = useState(true);
  const [showInstructor, setShowInstructor] = useState(true);
  const [instructorName, setInstructorName] = useState('Uzman Eğitmen Kadrosu');
  const [instructorExperience, setInstructorExperience] = useState('10+ Yıl Deneyim');
  const [instructorDescription, setInstructorDescription] = useState('');
  const [instructorAvatar, setInstructorAvatar] = useState('E');
  const [instructorImage, setInstructorImage] = useState('');
  const [isUploadingInstructor, setIsUploadingInstructor] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('BookOpen');
  const [categoryColor, setCategoryColor] = useState('from-blue-500 to-indigo-600');
  const [categorySortOrder, setCategorySortOrder] = useState('0');
  const [categoryShowInNavbar, setCategoryShowInNavbar] = useState(true);

  // Search Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('');
  const [orderSortBy, setOrderSortBy] = useState('newest');
  const [orderFilterProduct, setOrderFilterProduct] = useState('');
  const [orderFilterType, setOrderFilterType] = useState('');
  const [orderFilterDateRange, setOrderFilterDateRange] = useState('');

  // Products Management filter/search/sort/view state
  const [productsViewMode, setProductsViewMode] = useState('list'); // list or grid
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productFilterCategory, setProductFilterCategory] = useState('');
  const [productFilterBadge, setProductFilterBadge] = useState('');
  const [productSortBy, setProductSortBy] = useState('newest'); // newest, oldest, price-asc, price-desc, alphabet

  // Grant Access Form states
  const [grantEmail, setGrantEmail] = useState('');
  const [grantProductId, setGrantProductId] = useState('');
  const [grantAmount, setGrantAmount] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Coupon Form states
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState('PERCENTAGE'); // PERCENTAGE, FIXED
  const [couponValue, setCouponValue] = useState('');
  const [couponMaxUses, setCouponMaxUses] = useState('100');
  const [couponExpiryDate, setCouponExpiryDate] = useState('');
  const [couponProductId, setCouponProductId] = useState(''); // kept for simple back compat if any checks exist
  const [couponProductIds, setCouponProductIds] = useState([]);

  // Home Settings CMS states
  const [homeSettings, setHomeSettings] = useState({});
  const [homeTestimonials, setHomeTestimonials] = useState([]);
  const [globalFaqs, setGlobalFaqs] = useState([]);
  
  // Hero Form States
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroBtn1Text, setHeroBtn1Text] = useState('');
  const [heroBtn1Link, setHeroBtn1Link] = useState('');
  const [heroBtn2Text, setHeroBtn2Text] = useState('');
  const [heroBtn2Link, setHeroBtn2Link] = useState('');

  // Hero Bento Grid Cards Form States
  const [heroCard1Title, setHeroCard1Title] = useState('');
  const [heroCard1Subtitle, setHeroCard1Subtitle] = useState('');
  const [heroCard1Image, setHeroCard1Image] = useState('');
  const [heroCard1Link, setHeroCard1Link] = useState('');

  const [heroCard2Title, setHeroCard2Title] = useState('');
  const [heroCard2Subtitle, setHeroCard2Subtitle] = useState('');
  const [heroCard2Image, setHeroCard2Image] = useState('');
  const [heroCard2Badge, setHeroCard2Badge] = useState('');
  const [heroCard2Link, setHeroCard2Link] = useState('');

  const [heroCard3Title, setHeroCard3Title] = useState('');
  const [heroCard3Subtitle, setHeroCard3Subtitle] = useState('');
  const [heroCard3Image, setHeroCard3Image] = useState('');
  const [heroCard3Link, setHeroCard3Link] = useState('');

  // Campaign Form States
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignSubtitle, setCampaignSubtitle] = useState('');
  const [campaignBtnText, setCampaignBtnText] = useState('');
  const [campaignBtnLink, setCampaignBtnLink] = useState('');
  const [campaignHours, setCampaignHours] = useState('');

  // About Us Form States
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutSubtitle, setAboutSubtitle] = useState('');
  const [aboutMissionTitle, setAboutMissionTitle] = useState('');
  const [aboutMissionText, setAboutMissionText] = useState('');
  const [aboutVisionTitle, setAboutVisionTitle] = useState('');
  const [aboutVisionText, setAboutVisionText] = useState('');
  const [aboutImage, setAboutImage] = useState('');

  // Stats Form States
  const [stat1Label, setStat1Label] = useState('');
  const [stat1Value, setStat1Value] = useState('');
  const [stat1Suffix, setStat1Suffix] = useState('');
  const [stat2Label, setStat2Label] = useState('');
  const [stat2Value, setStat2Value] = useState('');
  const [stat2Suffix, setStat2Suffix] = useState('');
  const [stat3Label, setStat3Label] = useState('');
  const [stat3Value, setStat3Value] = useState('');
  const [stat3Suffix, setStat3Suffix] = useState('');

  // Testimonial Form States
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);
  const [testimonialName, setTestimonialName] = useState('');
  const [testimonialRole, setTestimonialRole] = useState('');
  const [testimonialComment, setTestimonialComment] = useState('');
  const [testimonialRating, setTestimonialRating] = useState('5');
  const [testimonialAvatar, setTestimonialAvatar] = useState('');

  // Section visibility states
  const [showHero, setShowHero] = useState(true);
  const [showBento, setShowBento] = useState(true);
  const [showCampaign, setShowCampaign] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showAbout, setShowAbout] = useState(true);
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [showSlider, setShowSlider] = useState(true);

  // Homepage section order state
  const [sectionOrder, setSectionOrder] = useState([
    'slider', 'hero', 'bento', 'products', 'campaign', 'stats', 'about', 'testimonials', 'badges'
  ]);

  // Homepage custom states
  const [activeHomeTab, setActiveHomeTab] = useState('hero');
  const [sliders, setSliders] = useState([]);
  const [isUploadingCard1, setIsUploadingCard1] = useState(false);
  const [isUploadingCard2, setIsUploadingCard2] = useState(false);
  const [isUploadingCard3, setIsUploadingCard3] = useState(false);
  const [isUploadingAbout, setIsUploadingAbout] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Student detail view state
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalGrantProductId, setModalGrantProductId] = useState('');
  const [modalGrantAmount, setModalGrantAmount] = useState('');
  const [modalIsSubmitting, setModalIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // User Form states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormPhone, setUserFormPhone] = useState('');
  const [userFormCity, setUserFormCity] = useState('');
  const [userFormDistrict, setUserFormDistrict] = useState('');
  const [userFormRole, setUserFormRole] = useState('STUDENT');
  const [isUserSubmitting, setIsUserSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCurrentAdmin();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (isModalOpen || isCouponModalOpen || isMobileSidebarOpen || isCategoryModalOpen || isTestimonialModalOpen || selectedUser || isUserModalOpen || confirmDialog.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen, isCouponModalOpen, isMobileSidebarOpen, isCategoryModalOpen, isTestimonialModalOpen, selectedUser, isUserModalOpen, confirmDialog.isOpen]);

  const fetchCurrentAdmin = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentAdminId(data.user?.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/';
      } else {
        setError('Çıkış yapılırken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Çıkış hatası:', err);
      setError('Sistem hatası nedeniyle çıkış yapılamadı.');
    }
  };

  const handleOpenAddUserModal = () => {
    setUserFormName('');
    setUserFormEmail('');
    setUserFormPassword('');
    setUserFormPhone('');
    setUserFormCity('');
    setUserFormDistrict('');
    setUserFormRole('STUDENT');
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setIsUserSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userFormName,
          email: userFormEmail,
          password: userFormPassword,
          phone: userFormPhone,
          city: userFormCity,
          district: userFormDistrict,
          role: userFormRole,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Kullanıcı başarıyla oluşturuldu.');
        setIsUserModalOpen(false);
        fetchData();
      } else {
        setError(data.error || 'Kullanıcı oluşturulurken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Kullanıcı ekleme hatası:', err);
      setError('Sistem hatası nedeniyle kullanıcı eklenemedi.');
    } finally {
      setIsUserSubmitting(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [prodRes, ordRes, userRes, coupRes, msgRes, catRes, settingsRes, testimonialsRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/users'),
        fetch('/api/admin/coupons'),
        fetch('/api/admin/messages'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/settings'),
        fetch('/api/admin/testimonials')
      ]);

      if (prodRes.ok && ordRes.ok && userRes.ok && coupRes.ok && msgRes.ok && catRes.ok && settingsRes.ok && testimonialsRes.ok) {
        const prodData = await prodRes.json();
        const ordData = await ordRes.json();
        const userData = await userRes.json();
        const coupData = await coupRes.json();
        const msgData = await msgRes.json();
        const catData = await catRes.json();
        const settingsData = await settingsRes.json();
        const testimonialsData = await testimonialsRes.json();
        
        setProducts(prodData.products || []);
        setOrders(ordData.orders || []);
        setUsers(userData.users || []);
        setCoupons(coupData.coupons || []);
        setMessages(msgData.messages || []);
        setCategoriesList(catData.categories || []);
        
        const s = settingsData.settings || {};
        setHomeSettings(s);
        setHomeTestimonials(testimonialsData.testimonials || []);

        setShowHero(s.show_hero === undefined ? true : s.show_hero === 'true');
        setShowBento(s.show_bento === undefined ? true : s.show_bento === 'true');
        setShowCampaign(s.show_campaign === undefined ? true : s.show_campaign === 'true');
        setShowStats(s.show_stats === undefined ? true : s.show_stats === 'true');
        setShowAbout(s.show_about === undefined ? true : s.show_about === 'true');
        setShowTestimonials(s.show_testimonials === undefined ? true : s.show_testimonials === 'true');
        setShowSlider(s.show_slider === undefined ? true : s.show_slider === 'true');

        let parsedSliders = [];
        if (s.homepage_sliders) {
          try {
            parsedSliders = JSON.parse(s.homepage_sliders);
          } catch (e) {
            console.error('Sliders parse error:', e);
          }
        }
        setSliders(parsedSliders);

        if (s.homepage_section_order) {
          try {
            let parsedOrder = JSON.parse(s.homepage_section_order);
            if (!parsedOrder.includes('slider')) {
              parsedOrder = ['slider', ...parsedOrder];
            }
            setSectionOrder(parsedOrder);
          } catch (e) {
            console.error('Sıralama parse hatası:', e);
          }
        }

        // Initialize form states
        setHeroTitle(s.hero_title || '');
        setHeroSubtitle(s.hero_subtitle || '');
        setHeroBtn1Text(s.hero_btn1_text || '');
        setHeroBtn1Link(s.hero_btn1_link || '');
        setHeroBtn2Text(s.hero_btn2_text || '');
        setHeroBtn2Link(s.hero_btn2_link || '');

        setHeroCard1Title(s.hero_card1_title || '');
        setHeroCard1Subtitle(s.hero_card1_subtitle || '');
        setHeroCard1Image(s.hero_card1_image || '');
        setHeroCard1Link(s.hero_card1_link || '');

        setHeroCard2Title(s.hero_card2_title || '');
        setHeroCard2Subtitle(s.hero_card2_subtitle || '');
        setHeroCard2Image(s.hero_card2_image || '');
        setHeroCard2Badge(s.hero_card2_badge || '');
        setHeroCard2Link(s.hero_card2_link || '');

        setHeroCard3Title(s.hero_card3_title || '');
        setHeroCard3Subtitle(s.hero_card3_subtitle || '');
        setHeroCard3Image(s.hero_card3_image || '');
        setHeroCard3Link(s.hero_card3_link || '');

        setCampaignTitle(s.campaign_title || '');
        setCampaignSubtitle(s.campaign_subtitle || '');
        setCampaignBtnText(s.campaign_btn_text || '');
        setCampaignBtnLink(s.campaign_btn_link || '');
        setCampaignHours(s.campaign_hours || '');

        setAboutTitle(s.about_title || '');
        setAboutSubtitle(s.about_subtitle || '');
        setAboutMissionTitle(s.about_mission_title || '');
        setAboutMissionText(s.about_mission_text || '');
        setAboutVisionTitle(s.about_vision_title || '');
        setAboutVisionText(s.about_vision_text || '');
        setAboutImage(s.about_image || '');

        let stats = [];
        try {
          if (s.stats) stats = JSON.parse(s.stats);
        } catch (e) {
          console.error(e);
        }
        setStat1Label(stats[0]?.label || '');
        setStat1Value(stats[0]?.value || '');
        setStat1Suffix(stats[0]?.suffix || '');
        setStat2Label(stats[1]?.label || '');
        setStat2Value(stats[1]?.value || '');
        setStat2Suffix(stats[1]?.suffix || '');
        setStat3Label(stats[2]?.label || '');
        setStat3Value(stats[2]?.value || '');
        setStat3Suffix(stats[2]?.suffix || '');

        let faqsData = [];
        try {
          if (s.faqs) {
            faqsData = JSON.parse(s.faqs);
          } else {
            faqsData = [
              {
                id: '1',
                question: 'Dijital kitapları indirdikten sonra internetsiz kullanabilir miyim?',
                answer: 'Evet! Satın aldığınız dijital kitapları (PDF/ePub formatında) cihazınıza indirdikten sonra herhangi bir internet bağlantısına ihtiyaç duymadan, istediğiniz zaman kullanabilirsiniz.'
              },
              {
                id: '2',
                question: 'Satın aldığım kurslara ne kadar süreyle erişebilirim?',
                answer: 'Satın aldığınız video ders ve dijital kurs paketlerine 1 yıl (365 gün) boyunca sınırsız olarak erişim sağlayabilirsiniz. Ayrıca içerik güncellemelerinden ücretsiz olarak faydalanırsınız.'
              },
              {
                id: '3',
                question: 'Kredi kartına taksit imkanı var mı?',
                answer: 'Evet, anlaşmalı olduğumuz bankaların kredi kartlarıyla yapacağınız 200 TL ve üzeri alışverişlerinizde peşin fiyatına 3, toplamda 9 aya varan taksit seçeneklerinden yararlanabilirsiniz.'
              },
              {
                id: '4',
                question: 'Sınav paketlerini birden fazla cihazda kullanabilir miyim?',
                answer: 'Satın aldığınız ürünleri bilgisayar, tablet veya cep telefonunuzdan giriş yaparak kullanabilirsiniz. Güvenlik önlemleri gereği eşzamanlı olarak sadece tek bir cihazdan aktif oturum açabilirsiniz.'
              },
              {
                id: '5',
                question: 'İade politikanız nedir?',
                answer: 'Dijital ürünler doğası gereği indirilebilir içerik olduğundan, ürün dosyası indirilmemişse 14 gün içerisinde iade talebinde bulunabilirsiniz. Konuyla ilgili destek ekibimizle iletişime geçmeniz yeterlidir.'
              }
            ];
          }
        } catch (e) {
          console.error(e);
        }
        setGlobalFaqs(faqsData);

      } else {
        setError('Veriler sunucudan yüklenemedi. Yetkili olduğunuzdan emin olun.');
      }
    } catch (err) {
      setError('Veri çekme hatası oluştu.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Product Image Upload
  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setCoverImage(data.url);
        setSuccess('Kapak görseli başarıyla yüklendi!');
      } else {
        setError(data.error || 'Görsel yüklenemedi.');
      }
    } catch (err) {
      setError('Görsel yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  // Instructor Image Upload
  const handleUploadInstructorImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingInstructor(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setInstructorImage(data.url);
        setSuccess('Eğitmen görseli başarıyla yüklendi!');
      } else {
        setError(data.error || 'Görsel yüklenemedi.');
      }
    } catch (err) {
      setError('Görsel yüklenirken bir hata oluştu.');
    } finally {
      setIsUploadingInstructor(false);
    }
  };

  const handleUploadSettingImage = async (e, setter, loadingSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;

    loadingSetter(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setter(data.url);
        setSuccess('Görsel başarıyla yüklendi!');
      } else {
        setError(data.error || 'Görsel yüklenemedi.');
      }
    } catch (err) {
      setError('Görsel yüklenirken bir hata oluştu.');
    } finally {
      loadingSetter(false);
    }
  };

  // Product CRUD
  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setPrice('');
    setDiscountedPrice('');
    setIsFeatured(false);
    setIsBestseller(false);
    setType('Video Ders Seti');
    setCategoryId(categoriesList[0]?.id || '');
    setCoverImage('/covers/kombo.png');
    setDescription('');
    setContents([]);
    setOutcomesInput('');
    setPages('');
    setVideoCount('');
    setDuration('');
    setExamCount('');
    setSortOrder('0');
    setShowDemo(true);
    setDemoUrl('');
    setShowFaq(true);
    setFaqs([]);
    setShowOutcomes(true);
    setShowInstructor(true);
    setInstructorName('Uzman Eğitmen Kadrosu');
    setInstructorExperience('10+ Yıl Deneyim');
    setInstructorDescription('DereceUzem eğitmenleri, alanında uzman, binlerce öğrencinin derece yapmasına rehberlik etmiş tecrübeli öğretmenlerden oluşur. Müfredata tam hakimiyet ve yeni nesil soru tarzlarına yönelik özel taktiklerle dersleri işlerler. Video içeriklerimizde konular akılda kalıcı yöntemlerle ve sınav odaklı püf noktalarıyla aktarılır.');
    setInstructorAvatar('E');
    setInstructorImage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingId(product.id);
    setTitle(product.title);
    setPrice(product.price.toString());
    setDiscountedPrice(product.discountedPrice ? product.discountedPrice.toString() : '');
    setIsFeatured(product.isFeatured || false);
    setIsBestseller(product.isBestseller || false);
    setType(product.type);
    setCoverImage(product.coverImage);
    setDescription(product.description);
    setContents(product.contents || []);
    setOutcomesInput(product.outcomes ? product.outcomes.join(', ') : '');
    setPages(product.pages !== null && product.pages !== undefined ? product.pages.toString() : '');
    setVideoCount(product.videoCount !== null && product.videoCount !== undefined ? product.videoCount.toString() : '');
    setDuration(product.duration !== null && product.duration !== undefined ? product.duration : '');
    setExamCount(product.examCount !== null && product.examCount !== undefined ? product.examCount.toString() : '');
    setSortOrder(product.sortOrder !== null && product.sortOrder !== undefined ? product.sortOrder.toString() : '0');
    setShowDemo(product.showDemo !== false);
    setDemoUrl(product.demoUrl || '');
    setShowFaq(product.showFaq !== false);
    setFaqs(product.faqs && Array.isArray(product.faqs) ? product.faqs : []);
    setShowOutcomes(product.showOutcomes !== false);
    setShowInstructor(product.showInstructor !== false);
    setInstructorName(product.instructorName || 'Uzman Eğitmen Kadrosu');
    setInstructorExperience(product.instructorExperience || '10+ Yıl Deneyim');
    setInstructorDescription(product.instructorDescription || '');
    setInstructorAvatar(product.instructorAvatar || 'E');
    setInstructorImage(product.instructorImage || '');
    setCategoryId(product.categoryId || '');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const productPayload = {
      title,
      price: parseFloat(price),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
      isFeatured,
      isBestseller,
      type,
      coverImage,
      description,
      contents: contents.map(s => s.trim()).filter(Boolean),
      outcomes: outcomesInput.split(',').map(s => s.trim()).filter(Boolean),
      pages: pages ? parseInt(pages) : null,
      videoCount: videoCount ? parseInt(videoCount) : null,
      duration: duration || null,
      examCount: examCount ? parseInt(examCount) : null,
      showDemo,
      demoUrl: demoUrl || null,
      showFaq,
      faqs: faqs.length > 0 ? faqs : null,
      showOutcomes,
      showInstructor,
      instructorName,
      instructorExperience,
      instructorDescription,
      instructorAvatar,
      instructorImage,
      categoryId: categoryId || null,
      sortOrder: sortOrder ? parseInt(sortOrder) : 0
    };

    try {
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(editingId ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla oluşturuldu!');
        setIsModalOpen(false);
        fetchData();
      } else {
        setError(data.error || 'İşlem başarısız oldu.');
      }
    } catch (err) {
      setError('İşlem sırasında bir bağlantı hatası oluştu.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!(await showConfirm('Bu ürünü kalıcı olarak silmek istediğinize emin misiniz?', 'Ürünü Sil', 'danger'))) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess('Ürün başarıyla silindi.');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Ürün silinemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu.');
    }
  };

  // Grant Access
  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const selectedProduct = products.find(p => p.id === grantProductId);
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: grantEmail,
          productId: grantProductId,
          amount: grantAmount ? parseFloat(grantAmount) : selectedProduct?.price
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Kullanıcıya ürün erişimi başarıyla tanımlandı!');
        setGrantEmail('');
        setGrantProductId('');
        setGrantAmount('');
        fetchData();
      } else {
        setError(data.error || 'Erişim tanımlama işlemi başarısız.');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu.');
    }
  };

  // User Administration
  const handleToggleUserRole = async (userId, currentRole) => {
    if (userId === currentAdminId) {
      alert('Kendi admin yetkilerinizi kaldıramazsınız.');
      return;
    }

    const nextRole = currentRole === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    const nextRoleText = nextRole === 'STUDENT' ? 'Öğrenci' : 'Yönetici (Admin)';
    if (!(await showConfirm(`Kullanıcı rolünü "${nextRoleText}" olarak değiştirmek istediğinize emin misiniz?`, 'Rol Değiştirme', 'warning'))) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Kullanıcı rolü başarıyla güncellendi.');
        fetchData();
      } else {
        setError(data.error || 'Yetki güncellenemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentAdminId) {
      alert('Kendi hesabınızı silemezsiniz.');
      return;
    }

    if (!(await showConfirm('Bu kullanıcıyı ve tüm sipariş geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz!', 'Kullanıcıyı Sil', 'danger'))) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Kullanıcı hesabı başarıyla silindi.');
        fetchData();
      } else {
        setError(data.error || 'Kullanıcı silinemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    }
  };

  // Coupon Operations
  const handleOpenCouponModal = () => {
    setCouponCode('');
    setCouponType('PERCENTAGE');
    setCouponValue('');
    setCouponMaxUses('100');
    setCouponExpiryDate('');
    setCouponProductId('');
    setCouponProductIds([]);
    setIsCouponModalOpen(true);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      code: couponCode,
      discountType: couponType,
      discountValue: parseFloat(couponValue),
      maxUses: parseInt(couponMaxUses),
      expiryDate: couponExpiryDate || null,
      productIds: couponProductIds
    };

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('İndirim kuponu başarıyla oluşturuldu!');
        setIsCouponModalOpen(false);
        fetchData();
      } else {
        setError(data.error || 'Kupon oluşturulamadı.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    }
  };

  const handleToggleCouponStatus = async (couponId, currentStatus) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (res.ok) {
        setSuccess('Kupon durumu güncellendi.');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Kupon güncellenemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!(await showConfirm('Bu kupon kodunu silmek istediğinize emin misiniz?', 'Kuponu Sil', 'danger'))) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess('Kupon başarıyla silindi.');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Kupon silinemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    }
  };

  // Category Operations
  const handleOpenAddCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryIcon('BookOpen');
    setCategoryColor('from-blue-500 to-indigo-600');
    setCategorySortOrder((categoriesList.length).toString());
    setCategoryShowInNavbar(true);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || '');
    setCategoryIcon(cat.icon || 'BookOpen');
    setCategoryColor(cat.color || 'from-blue-500 to-indigo-600');
    setCategorySortOrder(cat.sortOrder !== undefined && cat.sortOrder !== null ? cat.sortOrder.toString() : '0');
    setCategoryShowInNavbar(cat.showInNavbar !== false);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name: categoryName,
      description: categoryDescription || null,
      icon: categoryIcon,
      color: categoryColor,
      sortOrder: categorySortOrder ? parseInt(categorySortOrder) : 0,
      showInNavbar: categoryShowInNavbar
    };

    try {
      const url = editingCategoryId ? `/api/admin/categories/${editingCategoryId}` : '/api/admin/categories';
      const method = editingCategoryId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(editingCategoryId ? 'Kategori başarıyla güncellendi!' : 'Kategori başarıyla oluşturuldu!');
        setIsCategoryModalOpen(false);
        fetchData();
      } else {
        setError(data.error || 'İşlem başarısız.');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu.');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!(await showConfirm('Bu kategoriyi silmek istediğinize emin misiniz? Bu kategoriye bağlı ürünlerin kategorisi sıfırlanacaktır.', 'Kategoriyi Sil', 'danger'))) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/categories/${catId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess('Kategori başarıyla silindi.');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Kategori silinemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    }
  };

  const handleMoveCategory = async (cat, direction) => {
    const index = categoriesList.findIndex(c => c.id === cat.id);
    if (index === -1) return;

    let targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categoriesList.length) return;

    const targetCat = categoriesList[targetIndex];

    const tempOrder = cat.sortOrder !== undefined ? cat.sortOrder : 0;
    const currentNewOrder = targetCat.sortOrder !== undefined ? targetCat.sortOrder : 0;
    const targetNewOrder = tempOrder;

    // Swap values locally first to avoid UI lag, but verify and fetch from server
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/admin/categories/${cat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: currentNewOrder })
        }),
        fetch(`/api/admin/categories/${targetCat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: targetNewOrder })
        })
      ]);

      if (res1.ok && res2.ok) {
        setSuccess('Kategori sırası başarıyla güncellendi.');
        fetchData();
      } else {
        setError('Kategori sırası güncellenirken hata oluştu.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    } finally {
      setIsLoading(false);
    }
  };

  // Support Message Operations
  const handleUpdateMessageStatus = async (msgId, nextStatus) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/messages/${msgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        setSuccess('Mesaj durumu başarıyla güncellendi.');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'İşlem başarısız.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!(await showConfirm('Bu mesajı silmek istediğinize emin misiniz?', 'Mesajı Sil', 'danger'))) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/messages/${msgId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess('Mesaj silindi.');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Mesaj silinemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    }
  };

  // Home Settings Operations
  const handleSaveHomeSettings = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (showSlider) {
      const emptySlider = sliders.find(s => !s.image);
      if (emptySlider) {
        setError('Lütfen tüm slaytlar için bir görsel yükleyin.');
        return;
      }
    }

    setIsLoading(true);

    const statsArray = [
      { label: stat1Label, value: parseInt(stat1Value) || 0, suffix: stat1Suffix },
      { label: stat2Label, value: parseInt(stat2Value) || 0, suffix: stat2Suffix },
      { label: stat3Label, value: parseInt(stat3Value) || 0, suffix: stat3Suffix }
    ];

    const payload = {
      settings: {
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_btn1_text: heroBtn1Text,
        hero_btn1_link: heroBtn1Link,
        hero_btn2_text: heroBtn2Text,
        hero_btn2_link: heroBtn2Link,
        
        hero_card1_title: heroCard1Title,
        hero_card1_subtitle: heroCard1Subtitle,
        hero_card1_image: heroCard1Image,
        hero_card1_link: heroCard1Link,
        
        hero_card2_title: heroCard2Title,
        hero_card2_subtitle: heroCard2Subtitle,
        hero_card2_image: heroCard2Image,
        hero_card2_badge: heroCard2Badge,
        hero_card2_link: heroCard2Link,
        
        hero_card3_title: heroCard3Title,
        hero_card3_subtitle: heroCard3Subtitle,
        hero_card3_image: heroCard3Image,
        hero_card3_link: heroCard3Link,

        campaign_title: campaignTitle,
        campaign_subtitle: campaignSubtitle,
        campaign_btn_text: campaignBtnText,
        campaign_btn_link: campaignBtnLink,
        campaign_hours: campaignHours,
        about_title: aboutTitle,
        about_subtitle: aboutSubtitle,
        about_mission_title: aboutMissionTitle,
        about_mission_text: aboutMissionText,
        about_vision_title: aboutVisionTitle,
        about_vision_text: aboutVisionText,
        about_image: aboutImage,
        stats: JSON.stringify(statsArray),
        show_hero: showHero.toString(),
        show_bento: showBento.toString(),
        show_campaign: showCampaign.toString(),
        show_stats: showStats.toString(),
        show_about: showAbout.toString(),
        show_testimonials: showTestimonials.toString(),
        show_slider: showSlider.toString(),
        homepage_sliders: JSON.stringify(sliders.map(({ image, link, title }) => ({ image, link, title }))),
        homepage_section_order: JSON.stringify(sectionOrder),
        faqs: JSON.stringify(globalFaqs.map(({ id, question, answer }) => ({ id, question, answer })))
      }
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess('Değişiklikleriniz başarıyla kaydedildi.');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Ayarlar kaydedilemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save testimonials section visibility in database and show success message
  const handleSaveTestimonialsVisibility = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const statsArray = [
        { label: stat1Label, value: parseInt(stat1Value) || 0, suffix: stat1Suffix },
        { label: stat2Label, value: parseInt(stat2Value) || 0, suffix: stat2Suffix },
        { label: stat3Label, value: parseInt(stat3Value) || 0, suffix: stat3Suffix }
      ];
      const payload = {
        settings: {
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle,
          hero_btn1_text: heroBtn1Text,
          hero_btn1_link: heroBtn1Link,
          hero_btn2_text: heroBtn2Text,
          hero_btn2_link: heroBtn2Link,
          hero_card1_title: heroCard1Title,
          hero_card1_subtitle: heroCard1Subtitle,
          hero_card1_image: heroCard1Image,
          hero_card1_link: heroCard1Link,
          hero_card2_title: heroCard2Title,
          hero_card2_subtitle: heroCard2Subtitle,
          hero_card2_image: heroCard2Image,
          hero_card2_badge: heroCard2Badge,
          hero_card2_link: heroCard2Link,
          hero_card3_title: heroCard3Title,
          hero_card3_subtitle: heroCard3Subtitle,
          hero_card3_image: heroCard3Image,
          hero_card3_link: heroCard3Link,
          campaign_title: campaignTitle,
          campaign_subtitle: campaignSubtitle,
          campaign_btn_text: campaignBtnText,
          campaign_btn_link: campaignBtnLink,
          campaign_hours: campaignHours,
          about_title: aboutTitle,
          about_subtitle: aboutSubtitle,
          about_mission_title: aboutMissionTitle,
          about_mission_text: aboutMissionText,
          about_vision_title: aboutVisionTitle,
          about_vision_text: aboutVisionText,
          about_image: aboutImage,
          stats: JSON.stringify(statsArray),
          show_hero: showHero.toString(),
          show_bento: showBento.toString(),
          show_campaign: showCampaign.toString(),
          show_stats: showStats.toString(),
          show_about: showAbout.toString(),
          show_testimonials: showTestimonials.toString()
        }
      };
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess('Değişiklikleriniz başarıyla kaydedildi.');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Ayarlar kaydedilemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    } finally {
      setIsLoading(false);
    }
  };

  // Testimonial Modal Handlers
  const handleOpenAddTestimonialModal = () => {
    setEditingTestimonialId(null);
    setTestimonialName('');
    setTestimonialRole('');
    setTestimonialComment('');
    setTestimonialRating('5');
    setTestimonialAvatar('');
    setIsTestimonialModalOpen(true);
  };

  const handleOpenEditTestimonialModal = (t) => {
    setEditingTestimonialId(t.id);
    setTestimonialName(t.name);
    setTestimonialRole(t.role);
    setTestimonialComment(t.comment);
    setTestimonialRating(t.rating.toString());
    setTestimonialAvatar(t.avatar || '');
    setIsTestimonialModalOpen(true);
  };

  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const payload = {
      name: testimonialName,
      role: testimonialRole,
      comment: testimonialComment,
      rating: parseInt(testimonialRating),
      avatar: testimonialAvatar
    };

    try {
      const url = editingTestimonialId 
        ? `/api/admin/testimonials/${editingTestimonialId}`
        : '/api/admin/testimonials';
      
      const method = editingTestimonialId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(editingTestimonialId ? 'Yorum güncellendi.' : 'Yeni yorum başarıyla eklendi.');
        setIsTestimonialModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Yorum kaydedilemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTestimonial = async (testimonialId) => {
    if (!(await showConfirm('Bu öğrenci yorumunu silmek istediğinize emin misiniz?', 'Yorumu Sil', 'danger'))) return;
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/testimonials/${testimonialId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess('Yorum silindi.');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Yorum silinemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered and Sorted Products
  const filteredProducts = products.filter(product => {
    const query = productSearchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      product.title.toLowerCase().includes(query) || 
      product.description.toLowerCase().includes(query) || 
      product.type.toLowerCase().includes(query);

    const matchesCategory = !productFilterCategory || product.categoryId === productFilterCategory;
    
    let matchesBadge = true;
    if (productFilterBadge === 'featured') {
      matchesBadge = product.isFeatured;
    } else if (productFilterBadge === 'bestseller') {
      matchesBadge = product.isBestseller;
    } else if (productFilterBadge === 'discounted') {
      matchesBadge = product.discountedPrice !== null && product.discountedPrice > 0;
    }

    return matchesSearch && matchesCategory && matchesBadge;
  }).sort((a, b) => {
    if (productSortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (productSortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (productSortBy === 'price-asc') {
      return a.price - b.price;
    }
    if (productSortBy === 'price-desc') {
      return b.price - a.price;
    }
    if (productSortBy === 'alphabet') {
      return a.title.localeCompare(b.title, 'tr');
    }
    return 0;
  });

  // Metrics calculating
  const totalRevenue = orders.filter(o => o.paymentStatus === 'SUCCESS').reduce((sum, o) => sum + o.amount, 0);
  const totalSales = orders.filter(o => o.paymentStatus === 'SUCCESS').length;
  const uniqueStudentsCount = users.length;

  const sidebarItems = [
    { id: 'products', label: 'Eğitim Paketleri', icon: Package },
    { id: 'categories', label: 'Kategori Yönetimi', icon: Layers },
    { id: 'home', label: 'Ana Sayfa Yönetimi', icon: Layout },
    { id: 'orders', label: 'Satış Geçmişi & Siparişler', icon: ShoppingBag },
    { id: 'users', label: 'Öğrenciler', icon: Users },
    { id: 'coupons', label: 'Kupon Kodları', icon: Gift },
    { 
      id: 'messages', 
      label: 'Destek Mesajları', 
      icon: MessageSquare,
      badge: messages.filter(m => m.status === 'UNREAD').length 
    },
    { id: 'grant', label: 'Manuel Erişim Tanımla', icon: Key },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">DereceUzem</h2>
        </div>
        
        <nav className="space-y-1.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSearchQuery('');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/15'
                    : 'text-slate-650 hover:text-slate-950 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-450'}`} strokeWidth={2} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${isActive ? 'bg-white text-amber-600' : 'bg-red-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-100 flex flex-col gap-2">
        <Link 
          href="/hesabim" 
          className="w-full py-3 rounded-2xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          Öğrenci Paneline Dön
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl text-xs font-bold bg-red-50 text-red-650 hover:bg-red-100 border border-red-100/50 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 pt-6 md:pt-8 pb-16">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">DereceUzem Admin</h1>
          </div>
          
          <div>
            {activeSection === 'products' && (
              <button 
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-sm hover:bg-amber-600 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Ürün
              </button>
            )}
            {activeSection === 'categories' && (
              <button 
                onClick={handleOpenAddCategoryModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-sm hover:bg-amber-600 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Kategori
              </button>
            )}
            {activeSection === 'home' && (
              <button 
                onClick={handleOpenAddTestimonialModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-sm hover:bg-amber-600 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Yorum
              </button>
            )}
            {activeSection === 'coupons' && (
              <button 
                onClick={handleOpenCouponModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition-all"
              >
                <Gift className="w-3.5 h-3.5" />
                Kupon
              </button>
            )}
            {activeSection === 'users' && (
              <button 
                onClick={handleOpenAddUserModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-sm hover:bg-amber-600 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Öğrenci
              </button>
            )}
          </div>
        </div>

        {/* Unified Dashboard Container */}
        <div className="bg-white border border-slate-200/80 rounded-[2rem] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[calc(100vh-10rem)]">
          {/* Desktop Left Sidebar */}
          <aside className="hidden md:block w-72 shrink-0 bg-white border-r border-slate-200/80 p-6">
            <div className="sticky top-6 md:top-8">
              {renderSidebarContent()}
            </div>
          </aside>

          {/* Right Content Area */}
          <div className="flex-1 p-6 md:p-8 min-w-0 bg-slate-50/50">
            
            {/* Top Bar for Desktop */}
            <div className="hidden md:flex items-center justify-between gap-6 border-b border-slate-200 pb-6 mb-8">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {sidebarItems.find(item => item.id === activeSection)?.label}
                </h1>
                <p className="text-slate-500 text-xs mt-1 font-semibold">DereceUzem Eğitim Yönetim Sistemi</p>
              </div>
              
              <div className="flex items-center gap-3">
                {activeSection === 'products' && (
                  <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/15 transition-all hover:-translate-y-0.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Yeni Ürün Ekle
                  </button>
                )}
                {activeSection === 'categories' && (
                  <button 
                    onClick={handleOpenAddCategoryModal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/15 transition-all hover:-translate-y-0.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Yeni Kategori Ekle
                  </button>
                )}
                {activeSection === 'home' && (
                  <button 
                    onClick={handleOpenAddTestimonialModal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/15 transition-all hover:-translate-y-0.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Yeni Yorum Ekle
                  </button>
                )}
                {activeSection === 'coupons' && (
                  <button 
                    onClick={handleOpenCouponModal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/15 transition-all hover:-translate-y-0.5"
                  >
                    <Gift className="w-4 h-4" />
                    Yeni Kupon Ekle
                  </button>
                )}
                {activeSection === 'users' && (
                  <button 
                    onClick={handleOpenAddUserModal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/15 transition-all hover:-translate-y-0.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Yeni Öğrenci Ekle
                  </button>
                )}
              </div>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                    <DollarSign className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Aktif</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{totalRevenue.toLocaleString('tr-TR')} ₺</h3>
                <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-wider">Toplam Gelir</p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                    <ShoppingBag className="w-5 h-5" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{totalSales}</h3>
                <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-wider">Başarılı Satışlar</p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600">
                    <Users className="w-5 h-5" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{uniqueStudentsCount}</h3>
                <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-wider">Kayıtlı Öğrenciler</p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
                    <Package className="w-5 h-5" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{products.length}</h3>
                <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-wider">Toplam Ürün</p>
              </div>
            </div>

            {/* Alerts Feedback */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-4 bg-red-50 text-red-650 border border-red-100 rounded-2xl mb-6 text-sm font-semibold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-650 border border-emerald-100 rounded-2xl mb-6 text-sm font-semibold">
                  <Check className="w-5 h-5 shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Global Search Bar (Only shown for lists: orders, users, coupons, messages) */}
            {activeSection !== 'grant' && activeSection !== 'products' && (
              <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ara (isim, e-posta, kod, konu...)"
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/5 transition-all text-sm font-medium shadow-sm"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {activeSection === 'orders' && (
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Product Filter */}
                    <div className="relative">
                      <select
                        value={orderFilterProduct}
                        onChange={(e) => setOrderFilterProduct(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold focus:outline-none focus:border-amber-500/40 transition-colors shadow-sm cursor-pointer"
                      >
                        <option value="">Eğitim: Tümü</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                      <select
                        value={orderFilterStatus}
                        onChange={(e) => setOrderFilterStatus(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold focus:outline-none focus:border-amber-500/40 transition-colors shadow-sm cursor-pointer"
                      >
                        <option value="">Ödeme Durumu: Tümü</option>
                        <option value="SUCCESS">Başarılı</option>
                        <option value="FAILED">Başarısız</option>
                        <option value="PENDING">Bekleyen</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Sales Type Filter */}
                    <div className="relative">
                      <select
                        value={orderFilterType}
                        onChange={(e) => setOrderFilterType(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold focus:outline-none focus:border-amber-500/40 transition-colors shadow-sm cursor-pointer"
                      >
                        <option value="">Satış Türü: Tümü</option>
                        <option value="pos">Sanal POS (Kart)</option>
                        <option value="manual">Manuel Tanımlama</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="relative">
                      <select
                        value={orderFilterDateRange}
                        onChange={(e) => setOrderFilterDateRange(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold focus:outline-none focus:border-amber-500/40 transition-colors shadow-sm cursor-pointer"
                      >
                        <option value="">Tarih Aralığı: Tümü</option>
                        <option value="today">Bugün</option>
                        <option value="week">Son 7 Gün</option>
                        <option value="month">Bu Ay</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="relative">
                      <select
                        value={orderSortBy}
                        onChange={(e) => setOrderSortBy(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold focus:outline-none focus:border-amber-500/40 transition-colors shadow-sm cursor-pointer"
                      >
                        <option value="newest">Tarih: Yeni &gt; Eski</option>
                        <option value="oldest">Tarih: Eski &gt; Yeni</option>
                        <option value="amount-desc">Tutar: Azalan</option>
                        <option value="amount-asc">Tutar: Artan</option>
                        <option value="name-asc">Öğrenci: A &gt; Z</option>
                        <option value="name-desc">Öğrenci: Z &gt; A</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading ? (
              <div className="py-24 text-center">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-semibold text-sm">Veriler yükleniyor...</p>
              </div>
            ) : (
              <div>
                {/* Products Management */}
                {activeSection === 'products' && (
                  <div className="space-y-6">
                    {/* Filtering and Layout Toolbar */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
                      {/* Search & Filters */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                        {/* Search Input */}
                        <div className="relative">
                          <input
                            type="text"
                            value={productSearchQuery}
                            onChange={(e) => setProductSearchQuery(e.target.value)}
                            placeholder="Eğitim paketi ara..."
                            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          {productSearchQuery && (
                            <button
                              onClick={() => setProductSearchQuery('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                          <select
                            value={productFilterCategory}
                            onChange={(e) => setProductFilterCategory(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors appearance-none cursor-pointer"
                          >
                            <option value="">Tüm Kategoriler</option>
                            {categoriesList.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Badge / Status Filter */}
                        <div className="relative">
                          <select
                            value={productFilterBadge}
                            onChange={(e) => setProductFilterBadge(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors appearance-none cursor-pointer"
                          >
                            <option value="">Tüm Rozetler / Durum</option>
                            <option value="featured">Öne Çıkanlar</option>
                            <option value="bestseller">Çok Satanlar</option>
                            <option value="discounted">İndirimli Ürünler</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Sorting */}
                        <div className="relative">
                          <select
                            value={productSortBy}
                            onChange={(e) => setProductSortBy(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors appearance-none cursor-pointer"
                          >
                            <option value="newest">En Yeni Eklenenler</option>
                            <option value="oldest">En Eski Eklenenler</option>
                            <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                            <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                            <option value="alphabet">İsim: A - Z</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>

                      {/* View Switcher Controls */}
                      <div className="flex items-center gap-2 border-l border-slate-100 pl-0 xl:pl-4 justify-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 hidden sm:inline-block">Görünüm:</span>
                        <div className="flex bg-slate-105 bg-slate-100 p-1 rounded-xl gap-0.5 border border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => setProductsViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${
                              productsViewMode === 'list'
                                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30'
                                : 'text-slate-400 hover:text-slate-700'
                            }`}
                            title="Liste Görünümü"
                          >
                            <List className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductsViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${
                              productsViewMode === 'grid'
                                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30'
                                : 'text-slate-400 hover:text-slate-700'
                            }`}
                            title="Grid Görünümü"
                          >
                            <LayoutGrid className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {filteredProducts.length > 0 ? (
                      productsViewMode === 'grid' ? (
                        /* Grid View */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden flex flex-col hover:shadow-lg hover:border-slate-350 transition-all">
                              <div className="relative aspect-[5/7] bg-slate-100 flex items-center justify-center border-b border-slate-100">
                                <img 
                                  src={product.coverImage || '/covers/kombo.png'} 
                                  alt={product.title} 
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-700 shadow-sm">
                                  {product.type}
                                </span>
                              </div>
                              <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <h3 className="font-bold text-md text-slate-800 line-clamp-1">{product.title}</h3>
                                    {product.isFeatured && (
                                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-605 text-amber-600 border border-amber-100 text-[8px] font-black uppercase tracking-wider shrink-0">Öne Çıkan</span>
                                    )}
                                  </div>
                                  <p className="text-slate-505 text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">{product.description}</p>
                                </div>
                                
                                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                                  <div className="flex flex-col">
                                    <span className="font-black text-slate-900 text-md">{product.price.toLocaleString('tr-TR')} ₺</span>
                                    {product.discountedPrice && (
                                      <span className="text-[10px] text-slate-400 line-through font-semibold">{product.discountedPrice.toLocaleString('tr-TR')} ₺</span>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleOpenEditModal(product)}
                                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-655 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="p-2 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* List (Table) View */
                        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50/50 whitespace-nowrap">
                                  <th className="py-4 px-3 w-16">Kapak</th>
                                  <th className="py-4 px-3">Eğitim Paketi / Başlık</th>
                                  <th className="py-4 px-3">Ürün Tipi</th>
                                  <th className="py-4 px-3">Kategori</th>
                                  <th className="py-4 px-3">Fiyat</th>
                                  <th className="py-4 px-3">Rozetler</th>
                                  <th className="py-4 px-3">Kayıt Tarihi</th>
                                  <th className="py-4 px-3 text-right">Aksiyonlar</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredProducts.map((product) => {
                                  const category = categoriesList.find(c => c.id === product.categoryId);
                                  return (
                                    <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors text-sm">
                                      <td className="py-3 px-3">
                                        <div className="w-12 aspect-[5/7] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                                          <img src={product.coverImage || '/covers/kombo.png'} alt={product.title} className="w-full h-full object-cover" />
                                        </div>
                                      </td>
                                      <td className="py-3 px-3 min-w-[150px]">
                                        <div className="font-bold text-slate-800 line-clamp-1 text-xs">{product.title}</div>
                                        <div className="text-[10px] text-slate-400 truncate max-w-[200px] font-medium" title={product.description}>{product.description}</div>
                                      </td>
                                      <td className="py-3 px-3 whitespace-nowrap">
                                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                          {product.type}
                                        </span>
                                      </td>
                                      <td className="py-3 px-3">
                                        {category ? (
                                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
                                            <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${category.color || 'from-blue-500 to-indigo-600'}`} />
                                            {category.name}
                                          </div>
                                        ) : (
                                          <span className="text-slate-400 text-xs font-medium">-</span>
                                        )}
                                      </td>
                                      <td className="py-3 px-3 whitespace-nowrap">
                                        <div className="font-bold text-slate-900 text-xs">{product.price.toLocaleString('tr-TR')} ₺</div>
                                        {product.discountedPrice && (
                                          <div className="text-[10px] text-slate-400 line-through font-semibold">{product.discountedPrice.toLocaleString('tr-TR')} ₺</div>
                                        )}
                                      </td>
                                      <td className="py-3 px-3">
                                        <div className="flex gap-1 flex-wrap whitespace-nowrap">
                                          {product.isFeatured && (
                                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-black uppercase tracking-wider">Öne Çıkan</span>
                                          )}
                                          {product.isBestseller && (
                                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-black uppercase tracking-wider">Çok Satan</span>
                                          )}
                                          {!product.isFeatured && !product.isBestseller && (
                                            <span className="text-slate-400 text-[10px] font-medium">-</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-3 px-3 text-xs text-slate-450 font-medium whitespace-nowrap">
                                        {new Date(product.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </td>
                                      <td className="py-3 px-3 text-right">
                                        <div className="flex justify-end gap-1.5">
                                          <button
                                            onClick={() => handleOpenEditModal(product)}
                                            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-655 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="p-1.5 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
                        <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-805 mb-2">Arama Sonucunda Ürün Bulunamadı</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">Filtreleri sıfırlayarak veya farklı kelimelerle arama yapmayı deneyebilirsiniz.</p>
                        <button 
                          onClick={() => {
                            setProductSearchQuery('');
                            setProductFilterCategory('');
                            setProductFilterBadge('');
                            setProductSortBy('newest');
                          }} 
                          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
                        >
                          Filtreleri Sıfırla
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Orders Log */}
                {activeSection === 'orders' && (
                  <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                    {orders.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50/50 whitespace-nowrap">
                              <th className="py-4 px-3">Öğrenci / Alıcı</th>
                              <th className="py-4 px-3">Satın Alınan Ürün</th>
                              <th className="py-4 px-3">Tarih</th>
                              <th className="py-4 px-3">Ödeme Durumu</th>
                              <th className="py-4 px-3 text-right">Tutar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              let processedOrders = orders.filter(order => {
                                // 1. Search Query filter
                                const query = searchQuery.toLowerCase().trim();
                                const matchesSearch = !query || (
                                  order.user?.name?.toLowerCase().includes(query) ||
                                  order.user?.email?.toLowerCase().includes(query) ||
                                  order.product?.title?.toLowerCase().includes(query)
                                );
                                
                                // 2. Payment Status filter
                                const matchesStatus = !orderFilterStatus || order.paymentStatus === orderFilterStatus;
                                
                                // 3. Product filter
                                const matchesProduct = !orderFilterProduct || order.productId === orderFilterProduct;

                                // 4. Sales/Payment Type filter
                                let matchesType = true;
                                if (orderFilterType === 'pos') {
                                  matchesType = order.paymentId !== 'MANUAL_GRANT_BY_ADMIN';
                                } else if (orderFilterType === 'manual') {
                                  matchesType = order.paymentId === 'MANUAL_GRANT_BY_ADMIN';
                                }

                                // 5. Date Range filter
                                let matchesDate = true;
                                if (orderFilterDateRange) {
                                  const orderDate = new Date(order.createdAt);
                                  const now = new Date();
                                  if (orderFilterDateRange === 'today') {
                                    matchesDate = orderDate.toDateString() === now.toDateString();
                                  } else if (orderFilterDateRange === 'week') {
                                    const sevenDaysAgo = new Date();
                                    sevenDaysAgo.setDate(now.getDate() - 7);
                                    matchesDate = orderDate >= sevenDaysAgo;
                                  } else if (orderFilterDateRange === 'month') {
                                    matchesDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                                  }
                                }

                                return matchesSearch && matchesStatus && matchesProduct && matchesType && matchesDate;
                              });
                              
                              // 3. Sorting
                              processedOrders.sort((a, b) => {
                                if (orderSortBy === 'newest') {
                                  return new Date(b.createdAt) - new Date(a.createdAt);
                                }
                                if (orderSortBy === 'oldest') {
                                  return new Date(a.createdAt) - new Date(b.createdAt);
                                }
                                if (orderSortBy === 'amount-desc') {
                                  return b.amount - a.amount;
                                }
                                if (orderSortBy === 'amount-asc') {
                                  return a.amount - b.amount;
                                }
                                if (orderSortBy === 'name-asc') {
                                  return (a.user?.name || '').localeCompare(b.user?.name || '', 'tr');
                                }
                                if (orderSortBy === 'name-desc') {
                                  return (b.user?.name || '').localeCompare(a.user?.name || '', 'tr');
                                }
                                return 0;
                              });

                              return processedOrders.map((order) => (
                                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors text-sm">
                                  <td className="py-3 px-3">
                                    <button
                                      onClick={() => {
                                        const targetUser = users.find(u => u.id === order.userId || u.email === order.user?.email);
                                        setSelectedUser(targetUser || order.user);
                                      }}
                                      className="font-bold text-slate-800 text-xs hover:text-indigo-600 hover:underline transition-colors text-left focus:outline-none block"
                                    >
                                      {order.user?.name || 'İsimsiz Kullanıcı'}
                                    </button>
                                    <div className="text-[10px] text-slate-400 font-medium">{order.user?.email}</div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="font-semibold text-slate-700 text-xs line-clamp-1">{order.product?.title}</div>
                                    <span className="text-[9px] font-bold text-slate-550 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded mt-0.5 inline-block whitespace-nowrap">
                                      {order.product?.type}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-xs text-slate-500 whitespace-nowrap">
                                    {new Date(order.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                  <td className="py-3 px-3 whitespace-nowrap">
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                      order.paymentStatus === 'SUCCESS' 
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                        : 'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                      {order.paymentStatus === 'SUCCESS' ? 'BAŞARILI' : 'BAŞARISIZ'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-right font-black text-slate-900 whitespace-nowrap text-xs">{order.amount.toLocaleString('tr-TR')} ₺</td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <ShoppingBag className="w-12 h-12 text-slate-350 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Henüz Sipariş Kaydı Bulunmuyor</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">Öğrenciler satın alım yaptığında kayıtlar burada belirecektir.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Users Administration Section */}
                {activeSection === 'users' && (
                  <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                    {users.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50/50 whitespace-nowrap">
                              <th className="py-4 px-3">Ad Soyad</th>
                              <th className="py-4 px-3">E-Posta</th>
                              <th className="py-4 px-3">Telefon</th>
                              <th className="py-4 px-3">Konum (İl/İlçe)</th>
                              <th className="py-4 px-3">Kayıt Tarihi</th>
                              <th className="py-4 px-3">Rol / Yetki</th>
                              <th className="py-4 px-3">Eğitim Sayısı</th>
                              <th className="py-4 px-3 text-right">Aksiyonlar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.filter(item => {
                              const query = searchQuery.toLowerCase().trim();
                              if (!query) return true;
                              return (
                                item.name?.toLowerCase().includes(query) ||
                                item.email?.toLowerCase().includes(query) ||
                                item.phone?.toLowerCase().includes(query) ||
                                item.city?.toLowerCase().includes(query) ||
                                item.district?.toLowerCase().includes(query)
                              );
                            }).map((item) => (
                              <tr 
                                key={item.id} 
                                onClick={() => setSelectedUser(item)}
                                className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm cursor-pointer"
                                title="Öğrenci Detaylarını Göster"
                              >
                                <td className="py-3 px-3 font-bold text-slate-800 flex items-center gap-1.5 hover:text-amber-500 transition-colors whitespace-nowrap text-xs">
                                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] text-slate-650 font-bold shrink-0">
                                    {item.name?.substring(0, 2).toUpperCase() || 'ÖG'}
                                  </div>
                                  <span>{item.name || 'Girilmemiş'}</span>
                                </td>
                                <td className="py-3 px-3 text-slate-600 font-medium select-all text-xs truncate max-w-[140px]" onClick={(e) => e.stopPropagation()} title={item.email}>{item.email}</td>
                                <td className="py-3 px-3 text-slate-650 font-semibold select-all text-xs whitespace-nowrap" onClick={(e) => e.stopPropagation()}>{item.phone || '-'}</td>
                                <td className="py-3 px-3 text-slate-550 font-medium text-xs whitespace-nowrap truncate max-w-[120px]" title={item.city ? `${item.district ? item.district + ', ' : ''}${item.city}` : ''}>
                                  {item.city ? `${item.district ? item.district + ', ' : ''}${item.city}` : '-'}
                                </td>
                                <td className="py-3 px-3 text-slate-550 text-xs whitespace-nowrap">
                                  {new Date(item.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                    item.role === 'ADMIN' 
                                      ? 'bg-red-50 text-red-650 border-red-100' 
                                      : 'bg-blue-50 text-blue-650 border-blue-100'
                                  }`}>
                                    {item.role === 'ADMIN' ? 'YÖNETİCİ' : 'ÖĞRENCİ'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-850 font-bold text-xs text-center">{item._count?.orders || 0}</td>
                                <td className="py-3 px-3 text-right">
                                  <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => handleToggleUserRole(item.id, item.role)}
                                      disabled={item.id === currentAdminId}
                                      className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-colors disabled:opacity-30 whitespace-nowrap"
                                    >
                                      {item.role === 'ADMIN' ? 'Öğrenci Yap' : 'Admin Yap'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(item.id)}
                                      disabled={item.id === currentAdminId}
                                      className="p-1 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-30"
                                    >
                                      <Trash className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-12 text-center text-slate-500">Kayıtlı kullanıcı bulunamadı.</div>
                    )}
                  </div>
                )}

                {/* Coupons Management Section */}
                {activeSection === 'coupons' && (
                  <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                    {coupons.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50/50 whitespace-nowrap">
                              <th className="py-4 px-3">Kupon Kodu</th>
                              <th className="py-4 px-3">İndirim Miktarı</th>
                              <th className="py-4 px-3">Limitler</th>
                              <th className="py-4 px-3">Son Kullanma</th>
                              <th className="py-4 px-3">Durum</th>
                              <th className="py-4 px-3 text-right">Aksiyonlar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {coupons.filter(coupon => {
                              const query = searchQuery.toLowerCase().trim();
                              if (!query) return true;
                              return coupon.code?.toLowerCase().includes(query);
                            }).map((coupon) => (
                              <tr key={coupon.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors text-sm">
                                <td className="py-3 px-3">
                                  <div className="font-mono font-black text-amber-600 tracking-wider text-xs">{coupon.code}</div>
                                  {coupon.productIds && coupon.productIds.length > 0 ? (
                                    <div className="text-[9px] text-slate-400 font-bold mt-0.5 truncate max-w-[150px]" title={coupon.productIds.map(id => products.find(p => p.id === id)?.title || 'Bilinmeyen Ürün').join(', ')}>
                                      Geçerli Ürünler: {coupon.productIds.map(id => products.find(p => p.id === id)?.title || 'Bilinmeyen Ürün').join(', ')}
                                    </div>
                                  ) : (
                                    <div className="text-[9px] text-slate-400 font-bold mt-0.5 whitespace-nowrap">
                                      Tüm Ürünlerde Geçerli (Global)
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <div className="font-black text-slate-800 text-xs">
                                    {coupon.discountType === 'PERCENTAGE' ? `%${coupon.discountValue}` : `${coupon.discountValue.toLocaleString('tr-TR')} ₺`}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-slate-550 font-medium text-xs whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <span>Kullanım: {coupon.uses} / {coupon.maxUses || '∞'}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-slate-550 text-xs whitespace-nowrap">
                                  {coupon.expiryDate ? (
                                    new Date(coupon.expiryDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
                                  ) : (
                                    <span className="text-slate-400 font-medium">Sınırsız</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                    coupon.isActive 
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}>
                                    {coupon.isActive ? 'AKTİF' : 'PASİF'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <div className="flex justify-end gap-1.5 whitespace-nowrap">
                                    <button
                                      onClick={() => handleToggleCouponStatus(coupon.id, coupon.isActive)}
                                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${
                                        coupon.isActive
                                          ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                          : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                      }`}
                                    >
                                      {coupon.isActive ? 'Pasife Al' : 'Aktife Al'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCoupon(coupon.id)}
                                      className="p-1 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-colors"
                                    >
                                      <Trash className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm">
                        <Gift className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Aktif Kupon Kodu Bulunmuyor</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">Yeni Kupon Ekle butonuna basarak indirim kodları üretebilirsiniz.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Support Messages Management Section */}
                {activeSection === 'messages' && (
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.filter(msg => {
                        const query = searchQuery.toLowerCase().trim();
                        if (!query) return true;
                        return (
                          msg.name?.toLowerCase().includes(query) ||
                          msg.email?.toLowerCase().includes(query) ||
                          msg.subject?.toLowerCase().includes(query) ||
                          msg.message?.toLowerCase().includes(query)
                        );
                      }).map((msg) => (
                        <div key={msg.id} className={`bg-white border rounded-3xl p-6 flex flex-col md:flex-row justify-between gap-5 transition-all shadow-sm ${
                          msg.status === 'UNREAD' ? 'border-amber-500/40 bg-amber-500/[0.01] shadow-md shadow-amber-500/[0.01]' : 'border-slate-200/80 hover:border-slate-350'
                        }`}>
                          <div className="space-y-2.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-black text-slate-800">{msg.name}</span>
                              <span className="text-xs text-slate-400 font-mono font-medium">{msg.email}</span>
                              <span className="text-slate-200 text-xs">|</span>
                              <span className="text-xs text-slate-550 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(msg.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            <div className="text-sm font-bold text-slate-700">
                              Konu: {msg.subject || 'Konu Belirtilmemiş'}
                            </div>
                            
                            <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                              {msg.message}
                            </p>
                          </div>

                          <div className="flex md:flex-col justify-end items-end gap-3 shrink-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                                msg.status === 'UNREAD' 
                                  ? 'bg-amber-50 text-amber-600 border-amber-100' 
                                  : msg.status === 'READ'
                                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              }`}>
                                {msg.status === 'UNREAD' ? 'OKUNMADI' : msg.status === 'READ' ? 'OKUNDU' : 'ÇÖZÜLDÜ'}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              {msg.status === 'UNREAD' && (
                                <button
                                  onClick={() => handleUpdateMessageStatus(msg.id, 'READ')}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 border border-blue-100 text-blue-650 hover:bg-blue-100 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Okundu
                                </button>
                              )}
                              {msg.status !== 'RESOLVED' && (
                                <button
                                  onClick={() => handleUpdateMessageStatus(msg.id, 'RESOLVED')}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                >
                                  <CheckSquare className="w-3.5 h-3.5" />
                                  Çözüldü
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1.5 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-colors"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
                        <MessageSquare className="w-12 h-12 text-slate-450 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Destek Talebi Bulunmuyor</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">İletişim formundan gönderilen tüm mesajlar burada listelenecektir.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Categories Management Section */}
                {activeSection === 'categories' && (
                  <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                    {categoriesList.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50/50 whitespace-nowrap">
                              <th className="py-4 px-3">Kategori Adı</th>
                              <th className="py-4 px-3">Slug</th>
                              <th className="py-4 px-3">Açıklama</th>
                              <th className="py-4 px-3">Sıra</th>
                              <th className="py-4 px-3">Ürün Sayısı</th>
                              <th className="py-4 px-3 text-right">Aksiyonlar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categoriesList.filter(cat => {
                              const query = searchQuery.toLowerCase().trim();
                              if (!query) return true;
                              return (
                                cat.name?.toLowerCase().includes(query) ||
                                cat.slug?.toLowerCase().includes(query) ||
                                cat.description?.toLowerCase().includes(query)
                              );
                            }).map((cat) => {
                              const originalIndex = categoriesList.findIndex(c => c.id === cat.id);
                              const isFirst = originalIndex === 0;
                              const isLast = originalIndex === categoriesList.length - 1;
                              return (
                                <tr key={cat.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors text-sm">
                                  <td className="py-3 px-3">
                                    <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs whitespace-nowrap">
                                      <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${cat.color || 'from-blue-500 to-indigo-600'}`} />
                                      <span>{cat.name}</span>
                                      {cat.showInNavbar !== false ? (
                                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100" title="Üst menüde gösterilir">Menü</span>
                                      ) : (
                                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200" title="Üst menüde gizlidir">Gizli</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 font-mono font-medium text-slate-550 text-xs whitespace-nowrap">{cat.slug}</td>
                                  <td className="py-3 px-3 text-slate-500 font-medium truncate max-w-[200px] text-xs" title={cat.description}>{cat.description || 'Açıklama belirtilmemiş'}</td>
                                  <td className="py-3 px-3 font-mono font-bold text-slate-750 text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <span>{cat.sortOrder !== undefined ? cat.sortOrder : 0}</span>
                                      <div className="flex flex-col gap-0.5">
                                        <button
                                          type="button"
                                          disabled={isFirst}
                                          onClick={() => handleMoveCategory(cat, 'up')}
                                          className="p-0.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-20 disabled:hover:bg-transparent"
                                          title="Yukarı Taşı"
                                        >
                                          <ArrowUp className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={isLast}
                                          onClick={() => handleMoveCategory(cat, 'down')}
                                          className="p-0.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-20 disabled:hover:bg-transparent"
                                          title="Aşağı Taşı"
                                        >
                                          <ArrowDown className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 text-slate-850 font-bold text-xs text-center">
                                    {cat._count?.products || 0}
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => handleOpenEditCategoryModal(cat)}
                                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        className="p-1.5 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-12 text-center text-slate-500">Kayıtlı kategori bulunamadı.</div>
                    )}
                  </div>
                )}

                {/* Home Settings Management Section */}
                {activeSection === 'home' && (() => {
                  const formatPreviewTitle = (text) => {
                    if (!text) return '';
                    const parts = text.split('**');
                    if (parts.length >= 3) {
                      return (
                        <>
                          {parts[0]}
                          <span className="text-amber-500 font-extrabold">
                            {parts[1]}
                          </span>
                          {parts[2]}
                        </>
                      );
                    }
                    return text;
                  };

                  const renderLivePreview = () => (
                    <div className="sticky top-6 border-8 border-slate-900 rounded-[2.5rem] bg-slate-950 overflow-hidden shadow-2xl relative w-full aspect-[9/16] max-h-[640px] flex flex-col">
                      {/* Device Speaker / Notch */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-40 flex items-center justify-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        <div className="w-10 h-1 bg-slate-800 rounded-full" />
                      </div>

                      {/* Device screen */}
                      <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-800 text-left font-sans select-none scrollbar-thin p-3 pt-8 space-y-6">
                        {/* Mock Navbar */}
                        <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-200">
                          <span className="text-xs font-black text-slate-900 tracking-tight">DereceUzem</span>
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-650 font-bold">
                            {instructorAvatar || 'U'}
                          </div>
                        </div>

                        {/* Slider Preview */}
                        {showSlider && (
                          <div className="relative aspect-[2.4/1] bg-slate-200 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                            {sliders.filter(s => s && s.image).length > 0 ? (
                              <div className="relative w-full h-full">
                                <img 
                                  src={sliders.filter(s => s && s.image)[0].image} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover" 
                                />
                                {sliders.filter(s => s && s.image)[0].title && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-1 text-white text-center">
                                    <p className="text-[7px] font-bold truncate">{sliders.filter(s => s && s.image)[0].title}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center p-2 text-slate-400">
                                <LayoutGrid className="w-4 h-4 mx-auto mb-0.5 opacity-60" />
                                <span className="text-[7px] font-bold">Slider Görseli Yok</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Hero Section Preview */}
                        <div className="relative bg-slate-100/50 rounded-2xl p-4 text-center overflow-hidden border border-slate-200/40">
                          <div className="absolute top-0 left-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                          <div className="absolute bottom-0 right-0 w-24 h-24 bg-orange-400/10 rounded-full blur-xl pointer-events-none" />
                          <h4 className="text-sm font-black tracking-tight text-slate-900 leading-tight mb-2">
                            {formatPreviewTitle(heroTitle)}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-3">
                            {heroSubtitle || 'Kısa açıklama belirtilmemiş.'}
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-bold">
                              {heroBtn1Text || 'Düğme 1'}
                            </span>
                            <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-lg text-[9px] font-bold">
                              {heroBtn2Text || 'Düğme 2'}
                            </span>
                          </div>
                        </div>

                        {/* Bento Grid Cards Preview */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bento Grid Kartları</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2.5">
                            {/* Card 1 */}
                            <div 
                              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 flex flex-col justify-end p-2 bg-cover bg-center bg-slate-200"
                              style={{ backgroundImage: heroCard1Image ? `url(${heroCard1Image})` : 'none' }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                              <div className="relative z-10 text-white">
                                <h5 className="text-[9px] font-black leading-tight truncate">{heroCard1Title || 'Kart 1 Başlığı'}</h5>
                                <p className="text-[7px] text-slate-300 font-medium leading-tight truncate">{heroCard1Subtitle || 'Alt başlık'}</p>
                              </div>
                            </div>

                            {/* Card 3 */}
                            <div 
                              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 flex flex-col justify-end p-2 bg-cover bg-center bg-slate-200"
                              style={{ backgroundImage: heroCard3Image ? `url(${heroCard3Image})` : 'none' }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                              <div className="relative z-10 text-white">
                                <h5 className="text-[9px] font-black leading-tight truncate">{heroCard3Title || 'Kart 3 Başlığı'}</h5>
                                <p className="text-[7px] text-slate-300 font-medium leading-tight truncate">{heroCard3Subtitle || 'Alt başlık'}</p>
                              </div>
                            </div>

                            {/* Card 2 (Wide) */}
                            <div 
                              className="col-span-2 relative h-16 rounded-xl overflow-hidden border border-slate-200 flex flex-col justify-end p-2 bg-cover bg-center bg-slate-200"
                              style={{ backgroundImage: heroCard2Image ? `url(${heroCard2Image})` : 'none' }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                              {heroCard2Badge && (
                                <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500 text-[6px] font-bold text-white rounded-md uppercase tracking-wider">
                                  {heroCard2Badge}
                                </span>
                              )}
                              <div className="relative z-10 text-white">
                                <h5 className="text-[9px] font-black leading-tight truncate">{heroCard2Title || 'Kart 2 Başlığı'}</h5>
                                <p className="text-[7px] text-slate-300 font-medium leading-tight truncate">{heroCard2Subtitle || 'Alt başlık'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Campaign Banner Preview */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 border border-slate-700/30">
                          <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-amber-400/5 blur-xl" />
                          <div className="flex items-center justify-between gap-3">
                            <div className="space-y-0.5 text-left flex-1 min-w-0">
                              <h5 className="text-[10px] font-black leading-tight truncate">{formatPreviewTitle(campaignTitle)}</h5>
                              <p className="text-[8px] text-slate-300 font-medium leading-relaxed line-clamp-1">{campaignSubtitle}</p>
                            </div>
                            <div className="flex gap-1.5 shrink-0 bg-slate-950/40 p-1.5 rounded-lg border border-slate-750/20 items-center justify-center">
                              <Clock className="w-2.5 h-2.5 text-amber-500" />
                              <span className="text-[9px] font-black font-mono tracking-tight text-white">{campaignHours || 48}sa</span>
                            </div>
                          </div>
                        </div>

                        {/* Stats Counter Preview */}
                        <div className="grid grid-cols-3 gap-2 bg-white border border-slate-200/60 p-2.5 rounded-xl shadow-sm">
                          <div className="text-center space-y-0.5">
                            <div className="text-xs font-black text-slate-900">{stat1Value || 0}{stat1Suffix}</div>
                            <div className="text-[7px] text-slate-400 font-bold uppercase truncate">{stat1Label || 'Sayaç 1'}</div>
                          </div>
                          <div className="text-center space-y-0.5 border-x border-slate-100">
                            <div className="text-xs font-black text-slate-900">{stat2Value || 0}{stat2Suffix}</div>
                            <div className="text-[7px] text-slate-400 font-bold uppercase truncate">{stat2Label || 'Sayaç 2'}</div>
                          </div>
                          <div className="text-center space-y-0.5">
                            <div className="text-xs font-black text-slate-900">{stat3Value || 0}{stat3Suffix}</div>
                            <div className="text-[7px] text-slate-400 font-bold uppercase truncate">{stat3Label || 'Sayaç 3'}</div>
                          </div>
                        </div>

                        {/* About Us Preview */}
                        <div className="bg-white border border-slate-200/60 p-3 rounded-xl space-y-2 text-left">
                          <div className="flex gap-2">
                            <div className="flex-1 space-y-1">
                              <h5 className="text-[9px] font-black text-slate-900 leading-tight truncate">{aboutTitle || 'Hakkımızda'}</h5>
                              <p className="text-[7px] text-slate-500 font-medium leading-relaxed line-clamp-2">{aboutSubtitle}</p>
                            </div>
                            {aboutImage && (
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-200">
                                <img src={aboutImage} alt="About preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );

                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                        
                        {/* Left: Tabbed Form Configurator (7 columns) */}
                        <div className="xl:col-span-7 space-y-6">
                          {/* Sub-tabs buttons */}
                          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-150/40 rounded-2xl border border-slate-200/60">
                            {[
                              { id: 'slider', label: 'Görsel Slider', icon: LayoutGrid },
                              { id: 'hero', label: 'Giriş (Hero)', icon: Layout },
                              { id: 'bento', label: 'Bento Kartları', icon: Layers },
                              { id: 'campaign', label: 'Fırsat Bannerı', icon: PlayCircle },
                              { id: 'stats', label: 'İstatistikler', icon: CheckSquare },
                              { id: 'about', label: 'Hakkımızda', icon: BookOpen },
                              { id: 'testimonials', label: 'Yorumlar', icon: MessageSquare },
                              { id: 'faq', label: 'S.S.S. Yönetimi', icon: HelpCircle },
                              { id: 'ordering', label: 'Bölüm Sıralaması', icon: List }
                            ].map((tab) => {
                              const TabIcon = tab.icon;
                              const isTabActive = activeHomeTab === tab.id;
                              return (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setActiveHomeTab(tab.id)}
                                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    isTabActive
                                      ? 'bg-amber-500 text-white shadow-sm'
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                                  }`}
                                >
                                  <TabIcon className="w-3.5 h-3.5" />
                                  <span>{tab.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {activeHomeTab !== 'testimonials' ? (
                            <form onSubmit={handleSaveHomeSettings} className="space-y-6">
                              
                              {/* Slider Settings */}
                              {activeHomeTab === 'slider' && (
                                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
                                  <div className="space-y-1 pb-2 border-b flex justify-between items-center flex-wrap gap-4">
                                    <div>
                                      <h3 className="text-md font-bold text-slate-900">Slider (Görsel Slaytlar) Ayarları</h3>
                                      <p className="text-xs text-slate-400 font-semibold">Ana sayfanın üst kısmında dönecek en fazla 6 slaytı yönetin.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={showSlider}
                                        onChange={(e) => setShowSlider(e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500/25 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                      <span className="ml-2 text-xs font-black text-slate-550 uppercase tracking-wider">{showSlider ? 'AÇIK' : 'KAPALI'}</span>
                                    </label>
                                  </div>

                                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
                                    <p className="font-bold">💡 Tavsiye Edilen Görsel Ölçü ve Formatı:</p>
                                    <p>Tavsiye Edilen Ölçü: <strong className="font-extrabold">1200 x 500 px</strong> | Önerilen Format: <strong className="font-extrabold">WEBP</strong> veya <strong className="font-extrabold">PNG</strong></p>
                                    <p>En fazla 6 adet slayt ekleyebilirsiniz.</p>
                                  </div>

                                  <div className="space-y-4">
                                    {sliders.map((slider, idx) => (
                                      <div key={idx} className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 space-y-3 relative">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSliders(prev => prev.filter((_, i) => i !== idx));
                                          }}
                                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-150 text-red-550 hover:text-red-700 hover:border-red-200 transition-colors"
                                          title="Slaytı Sil"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <h4 className="text-xs font-bold text-slate-550 border-b pb-1">Slayt #{idx + 1}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <div>
                                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Slayt Başlığı (Opsiyonel)</label>
                                            <input
                                              type="text"
                                              value={slider.title || ''}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setSliders(prev => {
                                                  const next = [...prev];
                                                  next[idx] = { ...next[idx], title: val };
                                                  return next;
                                                });
                                              }}
                                              placeholder="Örn: KPSS Kampanyası Başladı!"
                                              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-amber-500/40 outline-none"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Yönlendirme Linki (Opsiyonel)</label>
                                            <input
                                              type="text"
                                              value={slider.link || ''}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setSliders(prev => {
                                                  const next = [...prev];
                                                  next[idx] = { ...next[idx], link: val };
                                                  return next;
                                                });
                                              }}
                                              placeholder="Örn: /urunler?category=kpss"
                                              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-amber-500/40 outline-none"
                                            />
                                          </div>
                                        </div>

                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Slayt Görseli</label>
                                          {slider.image ? (
                                            <div className="space-y-2">
                                              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center h-32 w-full max-w-md">
                                                <img 
                                                  src={slider.image} 
                                                  alt={`Slayt ${idx + 1} Önizleme`} 
                                                  className="object-contain w-full h-full"
                                                />
                                              </div>
                                              <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-2 max-w-md">
                                                <span className="text-[11px] text-slate-500 font-mono truncate pl-1" title={slider.image}>
                                                  {slider.image.split('/').pop()}
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setSliders(prev => {
                                                      const next = [...prev];
                                                      next[idx] = { ...next[idx], image: '' };
                                                      return next;
                                                    });
                                                  }}
                                                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 border border-red-150 hover:border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                  <span>Kaldır</span>
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-white/50 text-center space-y-2 max-w-md">
                                              <span className="text-xs text-slate-450 font-semibold">Görsel Seçilmedi</span>
                                              <label className="cursor-pointer px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                                                {slider.isUploading ? (
                                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                  <PlusCircle className="w-4 h-4" />
                                                )}
                                                <span>Görsel Yükle</span>
                                                <input
                                                  type="file"
                                                  accept="image/*"
                                                  onChange={(e) => handleUploadSettingImage(e, 
                                                    (url) => {
                                                      setSliders(prev => {
                                                        const next = [...prev];
                                                        next[idx] = { ...next[idx], image: url };
                                                        return next;
                                                      });
                                                    }, 
                                                    (val) => {
                                                      setSliders(prev => {
                                                        const next = [...prev];
                                                        next[idx] = { ...next[idx], isUploading: val };
                                                        return next;
                                                      });
                                                    }
                                                  )}
                                                  className="hidden"
                                                />
                                              </label>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}

                                    {sliders.length < 6 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSliders(prev => [...prev, { image: '', link: '', title: '' }]);
                                        }}
                                        className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-500 hover:text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                                      >
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Yeni Slayt Ekle ({sliders.length}/6)</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Hero Settings */}
                              {activeHomeTab === 'hero' && (
                                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
                                  <div className="space-y-1 pb-2 border-b flex justify-between items-center flex-wrap gap-4">
                                    <div>
                                      <h3 className="text-md font-bold text-slate-900">Giriş (Hero) Bölümü Ayarları</h3>
                                      <p className="text-xs text-slate-400 font-semibold">Ana sayfa giriş başlığı, açıklaması ve ana butonlarını yönetin.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={showHero}
                                        onChange={(e) => setShowHero(e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500/25 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                      <span className="ml-2 text-xs font-black text-slate-550 uppercase tracking-wider">{showHero ? 'AÇIK' : 'KAPALI'}</span>
                                    </label>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                                        Hero Başlığı (Vurgulamak istediğiniz kelimeleri **...** arasına alın)
                                      </label>
                                      <input 
                                        type="text" 
                                        required
                                        value={heroTitle}
                                        onChange={(e) => setHeroTitle(e.target.value)}
                                        placeholder="Örn: Başarıya Giden Yolda **Dijital Eğitim** Platformu"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Hero Alt Başlığı</label>
                                      <textarea 
                                        rows={3}
                                        required
                                        value={heroSubtitle}
                                        onChange={(e) => setHeroSubtitle(e.target.value)}
                                        placeholder="Kısa açıklama..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold resize-none"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Buton 1 Metni</label>
                                        <input 
                                          type="text" 
                                          required
                                          value={heroBtn1Text}
                                          onChange={(e) => setHeroBtn1Text(e.target.value)}
                                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Buton 1 Linki</label>
                                        <input 
                                          type="text" 
                                          required
                                          value={heroBtn1Link}
                                          onChange={(e) => setHeroBtn1Link(e.target.value)}
                                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Buton 2 Metni</label>
                                        <input 
                                          type="text" 
                                          required
                                          value={heroBtn2Text}
                                          onChange={(e) => setHeroBtn2Text(e.target.value)}
                                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Buton 2 Linki</label>
                                        <input 
                                          type="text" 
                                          required
                                          value={heroBtn2Link}
                                          onChange={(e) => setHeroBtn2Link(e.target.value)}
                                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Bento Cards Settings */}
                              {activeHomeTab === 'bento' && (
                                <div className="space-y-6">
                                  {/* Bölüm Görünürlük Kontrolü */}
                                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex justify-between items-center flex-wrap gap-4">
                                    <div>
                                      <h3 className="text-sm font-bold text-slate-900">Bento Kartları Bölümü</h3>
                                      <p className="text-xs text-slate-400 font-semibold">Ana sayfa bento grid yapısındaki kart içeriklerini yönetin.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={showBento}
                                        onChange={(e) => setShowBento(e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500/25 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                      <span className="ml-2 text-xs font-black text-slate-550 uppercase tracking-wider">{showBento ? 'AÇIK' : 'KAPALI'}</span>
                                    </label>
                                  </div>

                                  {/* Card 1 */}
                                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                                    <h4 className="text-sm font-black text-slate-800 pb-1 border-b">Kart 1 (Dijital Kitaplar)</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Kart Başlığı</label>
                                        <input type="text" required value={heroCard1Title} onChange={(e) => setHeroCard1Title(e.target.value)} placeholder="Kart Başlığı" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none" />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Kart Alt Başlığı</label>
                                        <input type="text" required value={heroCard1Subtitle} onChange={(e) => setHeroCard1Subtitle(e.target.value)} placeholder="Kart Alt Başlığı" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none" />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Arka Plan Resim (Dosya Yükle / URL)</label>
                                        <div className="flex gap-2">
                                          <input type="text" required value={heroCard1Image} onChange={(e) => setHeroCard1Image(e.target.value)} placeholder="/covers/kitap.png" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono" />
                                          <label className="cursor-pointer px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0">
                                            {isUploadingCard1 ? (
                                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                              <PlusCircle className="w-4 h-4" />
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleUploadSettingImage(e, setHeroCard1Image, setIsUploadingCard1)} className="hidden" />
                                          </label>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Yönlenecek Sayfa</label>
                                        <input type="text" required value={heroCard1Link} onChange={(e) => setHeroCard1Link(e.target.value)} placeholder="/urunler?category=kitap" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none" />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card 2 */}
                                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                                    <h4 className="text-sm font-black text-slate-800 pb-1 border-b">Kart 2 (Video Dersler - Ortadaki Büyük Kart)</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Kart Başlığı</label>
                                        <input type="text" required value={heroCard2Title} onChange={(e) => setHeroCard2Title(e.target.value)} placeholder="Kart Başlığı" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none" />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Kart Alt Başlığı</label>
                                        <input type="text" required value={heroCard2Subtitle} onChange={(e) => setHeroCard2Subtitle(e.target.value)} placeholder="Kart Alt Başlığı" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none" />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Rozet Yazısı (Örn: Stüdyo Çekimi)</label>
                                        <input type="text" value={heroCard2Badge} onChange={(e) => setHeroCard2Badge(e.target.value)} placeholder="Rozet Yazısı" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none" />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Arka Plan Resim (Dosya Yükle / URL)</label>
                                        <div className="flex gap-2">
                                          <input type="text" required value={heroCard2Image} onChange={(e) => setHeroCard2Image(e.target.value)} placeholder="/covers/video.png" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono" />
                                          <label className="cursor-pointer px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0">
                                            {isUploadingCard2 ? (
                                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                              <PlusCircle className="w-4 h-4" />
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleUploadSettingImage(e, setHeroCard2Image, setIsUploadingCard2)} className="hidden" />
                                          </label>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Yönlenecek Sayfa</label>
                                        <input type="text" required value={heroCard2Link} onChange={(e) => setHeroCard2Link(e.target.value)} placeholder="/urunler?category=video" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none" />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card 3 */}
                                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                                    <h4 className="text-sm font-black text-slate-800 pb-1 border-b">Kart 3 (Online Denemeler)</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Kart Başlığı</label>
                                        <input type="text" required value={heroCard3Title} onChange={(e) => setHeroCard3Title(e.target.value)} placeholder="Kart Başlığı" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none" />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Kart Alt Başlığı</label>
                                        <input type="text" required value={heroCard3Subtitle} onChange={(e) => setHeroCard3Subtitle(e.target.value)} placeholder="Kart Alt Başlığı" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none" />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Arka Plan Resim (Dosya Yükle / URL)</label>
                                        <div className="flex gap-2">
                                          <input type="text" required value={heroCard3Image} onChange={(e) => setHeroCard3Image(e.target.value)} placeholder="/covers/deneme.png" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono" />
                                          <label className="cursor-pointer px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0">
                                            {isUploadingCard3 ? (
                                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                              <PlusCircle className="w-4 h-4" />
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleUploadSettingImage(e, setHeroCard3Image, setIsUploadingCard3)} className="hidden" />
                                          </label>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Yönlenecek Sayfa</label>
                                        <input type="text" required value={heroCard3Link} onChange={(e) => setHeroCard3Link(e.target.value)} placeholder="/urunler?category=deneme" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white outline-none" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Campaign Banner Settings */}
                              {activeHomeTab === 'campaign' && (
                                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
                                  <div className="space-y-1 pb-2 border-b flex justify-between items-center flex-wrap gap-4">
                                    <div>
                                      <h3 className="text-md font-bold text-slate-900">Kampanya Bannerı Ayarları</h3>
                                      <p className="text-xs text-slate-400 font-semibold">Geri sayımlı kampanya çubuğunu özelleştirin.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={showCampaign}
                                        onChange={(e) => setShowCampaign(e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500/25 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                      <span className="ml-2 text-xs font-black text-slate-550 uppercase tracking-wider">{showCampaign ? 'AÇIK' : 'KAPALI'}</span>
                                    </label>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                      <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                                          Kampanya Başlığı (Örn: **%40 İndirim**)
                                        </label>
                                        <input 
                                          type="text" 
                                          required
                                          value={campaignTitle}
                                          onChange={(e) => setCampaignTitle(e.target.value)}
                                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Geri Sayım Saati</label>
                                        <input 
                                          type="number" 
                                          required
                                          value={campaignHours}
                                          onChange={(e) => setCampaignHours(e.target.value)}
                                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Kampanya Açıklaması</label>
                                      <textarea 
                                        rows={3}
                                        required
                                        value={campaignSubtitle}
                                        onChange={(e) => setCampaignSubtitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold resize-none"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Buton Metni</label>
                                        <input 
                                          type="text" 
                                          required
                                          value={campaignBtnText}
                                          onChange={(e) => setCampaignBtnText(e.target.value)}
                                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Buton Linki</label>
                                        <input 
                                          type="text" 
                                          required
                                          value={campaignBtnLink}
                                          onChange={(e) => setCampaignBtnLink(e.target.value)}
                                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Stats Settings */}
                              {activeHomeTab === 'stats' && (
                                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
                                  <div className="space-y-1 pb-2 border-b flex justify-between items-center flex-wrap gap-4">
                                    <div>
                                      <h3 className="text-md font-bold text-slate-900">İstatistik Sayaçları Ayarları</h3>
                                      <p className="text-xs text-slate-400 font-semibold">Homepage üzerinde listelenen 3 adet dinamik istatistiği yönetin.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={showStats}
                                        onChange={(e) => setShowStats(e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500/25 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                      <span className="ml-2 text-xs font-black text-slate-550 uppercase tracking-wider">{showStats ? 'AÇIK' : 'KAPALI'}</span>
                                    </label>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                                        <h4 className="text-xs font-bold text-slate-550 mb-3 border-b pb-1">İstatistik 1 (Kullanıcı)</h4>
                                        <div className="space-y-3">
                                          <div>
                                            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Etiket</label>
                                            <input type="text" required value={stat1Label} onChange={(e) => setStat1Label(e.target.value)} placeholder="Etiket" className="w-full px-2.5 py-2 border rounded-xl text-xs bg-white font-semibold outline-none" />
                                          </div>
                                          <div>
                                            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Değer</label>
                                            <input type="number" required value={stat1Value} onChange={(e) => setStat1Value(e.target.value)} placeholder="Değer" className="w-full px-2.5 py-2 border rounded-xl text-xs bg-white font-semibold outline-none" />
                                          </div>
                                          <div>
                                            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sonek</label>
                                            <input type="text" value={stat1Suffix} onChange={(e) => setStat1Suffix(e.target.value)} placeholder="Örn: +" className="w-full px-2.5 py-2 border rounded-xl text-xs bg-white font-semibold outline-none" />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                                        <h4 className="text-xs font-bold text-slate-550 mb-3 border-b pb-1">İstatistik 2 (Kitap)</h4>
                                        <div className="space-y-3">
                                          <div>
                                            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Etiket</label>
                                            <input type="text" required value={stat2Label} onChange={(e) => setStat2Label(e.target.value)} placeholder="Etiket" className="w-full px-2.5 py-2 border rounded-xl text-xs bg-white font-semibold outline-none" />
                                          </div>
                                          <div>
                                            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Değer</label>
                                            <input type="number" required value={stat2Value} onChange={(e) => setStat2Value(e.target.value)} placeholder="Değer" className="w-full px-2.5 py-2 border rounded-xl text-xs bg-white font-semibold outline-none" />
                                          </div>
                                          <div>
                                            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sonek</label>
                                            <input type="text" value={stat2Suffix} onChange={(e) => setStat2Suffix(e.target.value)} placeholder="Örn: +" className="w-full px-2.5 py-2 border rounded-xl text-xs bg-white font-semibold outline-none" />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                                        <h4 className="text-xs font-bold text-slate-550 mb-3 border-b pb-1">İstatistik 3 (Saat)</h4>
                                        <div className="space-y-3">
                                          <div>
                                            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Etiket</label>
                                            <input type="text" required value={stat3Label} onChange={(e) => setStat3Label(e.target.value)} placeholder="Etiket" className="w-full px-2.5 py-2 border rounded-xl text-xs bg-white font-semibold outline-none" />
                                          </div>
                                          <div>
                                            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Değer</label>
                                            <input type="number" required value={stat3Value} onChange={(e) => setStat3Value(e.target.value)} placeholder="Değer" className="w-full px-2.5 py-2 border rounded-xl text-xs bg-white font-semibold outline-none" />
                                          </div>
                                          <div>
                                            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sonek</label>
                                            <input type="text" value={stat3Suffix} onChange={(e) => setStat3Suffix(e.target.value)} placeholder="Örn: +" className="w-full px-2.5 py-2 border rounded-xl text-xs bg-white font-semibold outline-none" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* About Settings */}
                              {activeHomeTab === 'about' && (
                                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
                                  <div className="space-y-1 pb-2 border-b flex justify-between items-center flex-wrap gap-4">
                                    <div>
                                      <h3 className="text-md font-bold text-slate-900">Hakkımızda Sayfası Ayarları</h3>
                                      <p className="text-xs text-slate-400 font-semibold">Hakkımızda sayfa içeriğini ve görsellerini yönetin.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={showAbout}
                                        onChange={(e) => setShowAbout(e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500/25 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                      <span className="ml-2 text-xs font-black text-slate-550 uppercase tracking-wider">{showAbout ? 'AÇIK' : 'KAPALI'}</span>
                                    </label>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Sayfa Başlığı</label>
                                      <input 
                                        type="text" 
                                        required
                                        value={aboutTitle}
                                        onChange={(e) => setAboutTitle(e.target.value)}
                                        placeholder="Örn: Eğitimde Yeni Bir Vizyon"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Üst Giriş Açıklaması</label>
                                      <textarea 
                                        rows={3}
                                        required
                                        value={aboutSubtitle}
                                        onChange={(e) => setAboutSubtitle(e.target.value)}
                                        placeholder="Örn: DereceUzem olarak, öğrencilerin potansiyellerini..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold resize-none"
                                      />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Misyon Başlığı</label>
                                          <input 
                                            type="text" 
                                            required
                                            value={aboutMissionTitle}
                                            onChange={(e) => setAboutMissionTitle(e.target.value)}
                                            placeholder="Örn: Misyonumuz"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Misyon Açıklaması</label>
                                          <textarea 
                                            rows={4}
                                            required
                                            value={aboutMissionText}
                                            onChange={(e) => setAboutMissionText(e.target.value)}
                                            placeholder="Misyon açıklaması..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold resize-none"
                                          />
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Vizyon Başlığı</label>
                                          <input 
                                            type="text" 
                                            required
                                            value={aboutVisionTitle}
                                            onChange={(e) => setAboutVisionTitle(e.target.value)}
                                            placeholder="Örn: Vizyonumuz"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Vizyon Açıklaması</label>
                                          <textarea 
                                            rows={4}
                                            required
                                            value={aboutVisionText}
                                            onChange={(e) => setAboutVisionText(e.target.value)}
                                            placeholder="Vizyon açıklaması..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold resize-none"
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Hakkımızda Görseli (Dosya Yükle / URL)</label>
                                      <div className="flex gap-3">
                                        <input 
                                          type="text" 
                                          required
                                          value={aboutImage}
                                          onChange={(e) => setAboutImage(e.target.value)}
                                          placeholder="Görsel linki..."
                                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-805 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-xs font-mono shadow-sm"
                                        />
                                        <label className="cursor-pointer px-4 py-3 bg-slate-905 hover:bg-slate-800 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm">
                                          {isUploadingAbout ? (
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <PlusCircle className="w-4 h-4" />
                                          )}
                                          <input type="file" accept="image/*" onChange={(e) => handleUploadSettingImage(e, setAboutImage, setIsUploadingAbout)} className="hidden" />
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activeHomeTab === 'ordering' && (
                                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
                                  <div className="space-y-1 pb-2 border-b">
                                    <h3 className="text-md font-bold text-slate-900">Ana Sayfa Bölüm Sıralaması</h3>
                                    <p className="text-xs text-slate-400 font-semibold">Ana sayfadaki bölümlerin gösterim sırasını yukarı/aşağı okları kullanarak düzenleyin.</p>
                                  </div>
                                  <div className="space-y-3">
                                    {sectionOrder.map((section, index) => {
                                      const sectionNames = {
                                        slider: { name: 'Görsel Slider', desc: 'Ana sayfanın üst kısmında dönecek opsiyonel görsel slaytlar' },
                                        hero: { name: 'Giriş (Hero) Bölümü', desc: 'Ana sayfa giriş başlığı, açıklaması ve ana butonları' },
                                        bento: { name: 'Bento Kategori Kartları', desc: 'Dijital Kitap, Video Ders ve Deneme Paketleri bento grid yapısı' },
                                        products: { name: 'Öne Çıkan Eğitim Paketleri', desc: 'Arama, filtreleme ve sıralama özellikli ürün listesi' },
                                        campaign: { name: 'Fırsat (Kampanya) Bannerı', desc: 'Geri sayım sayaçlı indirim bannerı' },
                                        stats: { name: 'İstatistik Sayaçları', desc: 'Aktif Öğrenci, Dijital Kitap ve Ders Videosu sayaçları' },
                                        about: { name: 'Hakkımızda Özeti', desc: 'Misyon, vizyon ve kurumsal tanıtım bloğu' },
                                        testimonials: { name: 'Öğrenci Yorumları', desc: 'Öğrencilerden gelen geri bildirim kartları' },
                                        badges: { name: 'Güvenilirlik Rozetleri', desc: 'Sitenin alt kısmında yer alan rozet logoları' }
                                      };

                                      const sec = sectionNames[section] || { name: section, desc: '' };

                                      return (
                                        <div 
                                          key={section}
                                          className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-200/80 transition-colors"
                                        >
                                          <div className="space-y-0.5">
                                            <span className="text-xs font-bold text-slate-400 mr-2">0{index + 1}</span>
                                            <span className="text-sm font-bold text-slate-800">{sec.name}</span>
                                            <p className="text-[11px] text-slate-400 font-medium">{sec.desc}</p>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <button
                                              type="button"
                                              disabled={index === 0}
                                              onClick={() => {
                                                const newOrder = [...sectionOrder];
                                                const temp = newOrder[index];
                                                newOrder[index] = newOrder[index - 1];
                                                newOrder[index - 1] = temp;
                                                setSectionOrder(newOrder);
                                              }}
                                              className={`p-2 rounded-xl border transition-colors ${
                                                index === 0
                                                  ? 'bg-slate-100 border-slate-100 text-slate-350 cursor-not-allowed'
                                                  : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50'
                                              }`}
                                            >
                                              <ArrowUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              disabled={index === sectionOrder.length - 1}
                                              onClick={() => {
                                                const newOrder = [...sectionOrder];
                                                const temp = newOrder[index];
                                                newOrder[index] = newOrder[index + 1];
                                                newOrder[index + 1] = temp;
                                                setSectionOrder(newOrder);
                                              }}
                                              className={`p-2 rounded-xl border transition-colors ${
                                                index === sectionOrder.length - 1
                                                  ? 'bg-slate-100 border-slate-100 text-slate-350 cursor-not-allowed'
                                                  : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50'
                                              }`}
                                            >
                                              <ArrowDown className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {activeHomeTab === 'faq' && (
                                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
                                  <div className="pb-2 border-b">
                                    <h3 className="text-md font-bold text-slate-900">Sıkça Sorulan Sorular (S.S.S.) Ayarları</h3>
                                    <p className="text-xs text-slate-400 font-semibold">Web sitesindeki genel S.S.S. sayfasında gösterilen soru ve cevapları düzenleyin.</p>
                                  </div>

                                  <div className="space-y-4">
                                    {globalFaqs.map((faq, idx) => (
                                      <div key={faq.id || idx} className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 space-y-3 relative">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newFaqs = globalFaqs.filter((_, i) => i !== idx);
                                            setGlobalFaqs(newFaqs);
                                          }}
                                          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                          <Trash className="w-4 h-4" />
                                        </button>

                                        <div className="text-xs font-bold text-slate-400">Soru #{idx + 1}</div>

                                        <div className="grid grid-cols-1 gap-3">
                                          <div>
                                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Soru</label>
                                            <input
                                              type="text"
                                              required
                                              value={faq.question || ''}
                                              onChange={(e) => {
                                                const newFaqs = [...globalFaqs];
                                                newFaqs[idx] = { ...newFaqs[idx], question: e.target.value };
                                                setGlobalFaqs(newFaqs);
                                              }}
                                              placeholder="Örn: Dijital kitapları internetsiz kullanabilir miyim?"
                                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-amber-500/40 outline-none transition-colors"
                                            />
                                          </div>

                                          <div>
                                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Cevap</label>
                                            <textarea
                                              required
                                              rows={3}
                                              value={faq.answer || ''}
                                              onChange={(e) => {
                                                const newFaqs = [...globalFaqs];
                                                newFaqs[idx] = { ...newFaqs[idx], answer: e.target.value };
                                                setGlobalFaqs(newFaqs);
                                              }}
                                              placeholder="Örn: Evet, cihazınıza indirdikten sonra internetsiz kullanabilirsiniz."
                                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-amber-500/40 outline-none transition-colors resize-none"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setGlobalFaqs([...globalFaqs, { id: String(Date.now()), question: '', answer: '' }]);
                                      }}
                                      className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-500 hover:text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                                    >
                                      <PlusCircle className="w-4 h-4" />
                                      <span>Yeni Soru Ekle</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Form Save Button */}
                              <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button 
                                  type="submit"
                                  className="px-6 py-3.5 rounded-2xl font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/10 transition-all flex items-center gap-1.5"
                                >
                                  {isLoading ? (
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                  <span>Tüm Ayarları Kaydet</span>
                                </button>
                              </div>

                            </form>
                          ) : (
                            
                            /* Testimonials Panel */
                            <div className="space-y-6">
                              {/* Bölüm Görünürlük Kontrolü */}
                              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex justify-between items-center flex-wrap gap-4">
                                <div>
                                  <h3 className="text-sm font-bold text-slate-900">Yorumlar Bölümü Görünürlüğü</h3>
                                  <p className="text-xs text-slate-400 font-semibold">Ana sayfanın altındaki öğrenci yorumları bölümünü açın veya kapatın.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <label className="relative inline-flex items-center cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={showTestimonials}
                                      onChange={(e) => setShowTestimonials(e.target.checked)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500/25 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    <span className="ml-2 text-xs font-black text-slate-550 uppercase tracking-wider">{showTestimonials ? 'AÇIK' : 'KAPALI'}</span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={handleSaveTestimonialsVisibility}
                                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                                  >
                                    {isLoading ? (
                                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5" />
                                    )}
                                    <span>Ayarları Kaydet</span>
                                  </button>
                                </div>
                              </div>

                              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                                <div className="px-6 py-5 border-b border-slate-105 flex justify-between items-center bg-white">
                                  <div>
                                    <h3 className="text-md font-bold text-slate-900">Öğrenci Yorumları (Testimonials)</h3>
                                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Platform hakkında sitenin alt kısmında dönecek yorumları yönetin.</p>
                                  </div>
                                <button 
                                  type="button"
                                  onClick={handleOpenAddTestimonialModal}
                                  className="px-4 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-1"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  Yorum Ekle
                                </button>
                              </div>
                              
                              {homeTestimonials.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                  {homeTestimonials.map((t) => (
                                    <div key={t.id} className="bg-white border border-slate-200/80 hover:border-slate-350 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5 relative group">
                                      <div className="space-y-3">
                                        {/* Stars and Rating */}
                                        <div className="flex items-center justify-between">
                                          <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                              <Star 
                                                key={i} 
                                                className={`w-4 h-4 ${
                                                  i < t.rating 
                                                    ? 'fill-amber-400 text-amber-400' 
                                                    : 'text-slate-200'
                                                }`} 
                                              />
                                            ))}
                                          </div>
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                                            {t.rating} / 5 Puan
                                          </span>
                                        </div>

                                        {/* Comment Text */}
                                        <p className="text-slate-655 text-slate-600 text-xs leading-relaxed font-medium italic bg-slate-50/40 p-3.5 rounded-2xl border border-slate-100/50">
                                          &ldquo;{t.comment}&rdquo;
                                        </p>
                                      </div>

                                      {/* Student info & Action buttons */}
                                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-1">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                            {t.avatar && (t.avatar.startsWith('/') || t.avatar.startsWith('http')) ? (
                                              <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                                            ) : (
                                              t.avatar || t.name.substring(0, 2).toUpperCase()
                                            )}
                                          </div>
                                          <div className="min-w-0">
                                            <h4 className="font-bold text-slate-850 text-xs truncate">{t.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-semibold truncate">{t.role}</p>
                                          </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditTestimonialModal(t)}
                                            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                            title="Düzenle"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteTestimonial(t.id)}
                                            className="p-2 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors"
                                            title="Sil"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-12 text-center text-slate-500 font-semibold text-xs">Yorum bulunamadı. &quot;Yorum Ekle&quot; butonuyla ekleme yapabilirsiniz.</div>
                              )}
                            </div>
                            
                            </div>

                          )}
                        </div>

                        {/* Right: Live Mockup Screen (5 columns) */}
                        <div className="xl:col-span-5 hidden xl:block sticky top-8">
                          {renderLivePreview()}
                        </div>

                      </div>
                    </div>
                  );
                })()}

                {/* Grant Access Form */}
                {activeSection === 'grant' && (
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-8 max-w-xl mx-auto shadow-sm">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Manuel Ürün Erişimi Tanımla</h3>
                      <p className="text-slate-500 text-xs leading-relaxed font-medium">
                        Öğrencilerin e-posta adreslerini yazarak dilediğiniz eğitimi anında profillerine ekleyebilirsiniz.
                      </p>
                    </div>

                    <form onSubmit={handleGrantAccess} className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest pl-1">Öğrenci Seçin</label>
                        
                        {/* Quick filter input */}
                        <input 
                          type="text"
                          placeholder="Öğrenci ara (isim veya e-posta)..."
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200/60 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-500/30 transition-colors"
                        />

                        <select 
                          required
                          value={grantEmail}
                          onChange={(e) => setGrantEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors cursor-pointer"
                        >
                          <option value="">-- Öğrenci Seçin --</option>
                          {users
                            .filter(u => {
                              const sQuery = (studentSearchQuery || '').toLowerCase().trim();
                              if (!sQuery) return true;
                              return (
                                u.name?.toLowerCase().includes(sQuery) ||
                                u.email?.toLowerCase().includes(sQuery)
                              );
                            })
                            .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr'))
                            .map(u => (
                              <option key={u.id} value={u.email}>
                                {u.name ? `${u.name} (${u.email})` : u.email}
                              </option>
                            ))
                          }
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-2 pl-1">Erişim Verilecek Ürün</label>
                        <select 
                          required
                          value={grantProductId}
                          onChange={(e) => setGrantProductId(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors"
                        >
                          <option value="">-- Ürün Seçin --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.title} ({p.price.toLocaleString('tr-TR')} ₺)</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Tutar (Opsiyonel - Farklı Tutar Tanımlanacaksa)</label>
                        <input 
                          type="number" 
                          value={grantAmount}
                          onChange={(e) => setGrantAmount(e.target.value)}
                          placeholder="Boş bırakırsanız varsayılan ürün fiyatı alınır"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/10"
                      >
                        <Send className="w-4 h-4" />
                        Erişimi Tanımla
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Framer Motion Drawer) */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 bg-slate-955/60 backdrop-blur-sm"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white border-r border-slate-200 p-6 shadow-2xl flex flex-col z-50"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Navigasyon</span>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {renderSidebarContent()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Add / Edit Product */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-955/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 shrink-0 bg-white">
                <h3 className="text-lg font-black text-slate-900">
                  {editingId ? 'Eğitimi Düzenle' : 'Yeni Eğitim Ekle'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-655 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Content */}
              <form onSubmit={handleSaveProduct} data-lenis-prevent className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
                
                {/* Section: Temel Bilgiler */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Temel Bilgiler</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Eğitim Başlığı</label>
                      <input 
                        type="text" 
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Örn: 10. Sınıf Matematik Seti"
                        className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Kategori / Ürün Tipi</label>
                      <div className="relative">
                        <select 
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-bold shadow-sm appearance-none cursor-pointer"
                        >
                          <option value="">-- Kategori Seçin --</option>
                          {categoriesList.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Fiyatlandırma & Satış */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Fiyatlandırma & Satış Seçenekleri</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Fiyat</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="Örn: 299"
                          className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₺</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">İndirimli Fiyat (Opsiyonel)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={discountedPrice}
                          onChange={(e) => setDiscountedPrice(e.target.value)}
                          placeholder="Örn: 199"
                          className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₺</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Sıralama (Sıra No)</label>
                      <input 
                        type="number" 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        placeholder="Örn: 1"
                        className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {/* Switch: Featured */}
                    <label className="flex items-center gap-4 cursor-pointer group select-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-4 rounded-2xl transition-all">
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Öne Çıkan Ürün</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Ana sayfadaki vitrinde gösterilsin.</span>
                      </div>
                    </label>

                    {/* Switch: Bestseller */}
                    <label className="flex items-center gap-4 cursor-pointer group select-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-4 rounded-2xl transition-all">
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          checked={isBestseller}
                          onChange={(e) => setIsBestseller(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Çok Satan Ürün</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">&quot;Çok Satan&quot; etiketiyle vurgulansın.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Section: Teknik Özellikler (Dinamik) */}
                {(type === 'Dijital Kitap' || type === 'Video Ders Seti' || type === 'Deneme Paketi' || type === 'Kombo Paket') && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Eğitim Detayları & Metrikler</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(type === 'Dijital Kitap' || type === 'Kombo Paket') && (
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Sayfa Sayısı</label>
                          <input 
                            type="number" 
                            value={pages}
                            onChange={(e) => setPages(e.target.value)}
                            placeholder="Örn: 450"
                            className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                          />
                        </div>
                      )}

                      {(type === 'Video Ders Seti' || type === 'Kombo Paket') && (
                        <>
                          <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Video Sayısı</label>
                            <input 
                              type="number" 
                              value={videoCount}
                              onChange={(e) => setVideoCount(e.target.value)}
                              placeholder="Örn: 120"
                              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Toplam Süre</label>
                            <input 
                              type="text" 
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                              placeholder="Örn: 96 saat"
                              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                            />
                          </div>
                        </>
                      )}

                      {(type === 'Deneme Paketi' || type === 'Kombo Paket') && (
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Deneme Sayısı</label>
                          <input 
                            type="number" 
                            value={examCount}
                            onChange={(e) => setExamCount(e.target.value)}
                            placeholder="Örn: 30"
                            className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section: Görsel Tanımlama */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Kapak Görseli</h4>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-slate-50/50 border border-slate-200/60 p-4 rounded-3xl">
                    {/* Live Preview Card */}
                    <div className="relative aspect-[5/7] w-32 shrink-0 bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
                      {coverImage ? (
                        <img 
                          src={coverImage} 
                          alt="Önizleme" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-2.5">
                      <div className="flex items-center justify-between pl-1">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Görsel Dosya Yolu / Dosya Yükle</label>
                        <span className="text-[10px] text-amber-605 font-bold uppercase tracking-wider">Önerilen: 600x840 px (5:7)</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                          type="text" 
                          required
                          value={coverImage}
                          onChange={(e) => setCoverImage(e.target.value)}
                          placeholder="Örn: /covers/matematik.png"
                          className="flex-1 px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-xs font-mono tracking-wide shadow-sm"
                        />
                        <label className="cursor-pointer px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm">
                          {isUploading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Yükleniyor...
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-4 h-4" />
                              Görsel Yükle
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleUploadImage} 
                            disabled={isUploading}
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Eğitim İçerik Detayları */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">İçerik Detayları</h4>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Açıklama</label>
                      <textarea 
                        rows={4}
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Eğitim içeriğinin kısa açıklaması..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm resize-none shadow-sm font-medium"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">İçindekiler</label>
                        <button
                          type="button"
                          onClick={() => setContents([...contents, ''])}
                          className="px-2.5 py-1 text-[10px] font-black tracking-wider uppercase bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Öğe Ekle
                        </button>
                      </div>
                      
                      {contents.length > 0 ? (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 border border-slate-100 p-2.5 rounded-2xl bg-slate-50/50">
                          {contents.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-400 w-5 text-right shrink-0">
                                {(index + 1).toString().padStart(2, '0')}
                              </span>
                              <input 
                                type="text" 
                                required
                                value={item}
                                onChange={(e) => {
                                  const newContents = [...contents];
                                  newContents[index] = e.target.value;
                                  setContents(newContents);
                                }}
                                placeholder="Örn: 📚 Matematik Konu Anlatımı Kitabı (456 sayfa)"
                                className="flex-1 px-3 py-2 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-xs font-semibold shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newContents = contents.filter((_, i) => i !== index);
                                  setContents(newContents);
                                }}
                                className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 rounded-xl transition-all shrink-0"
                                title="Müfredat Öğesini Sil"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs font-medium bg-slate-50/30">
                          Henüz hiçbir içerik eklenmedi. "Öğe Ekle" butonuna basarak başlayın.
                        </div>
                      )}
                    </div>

                    <label className="flex items-center gap-4 cursor-pointer group select-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-4 rounded-2xl transition-all">
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          checked={showOutcomes}
                          onChange={(e) => setShowOutcomes(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Kazanımlar Bölümünü Göster</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Ürün detay sayfasındaki &quot;Kazanımlar&quot; sekmesi aktif olsun.</span>
                      </div>
                    </label>

                    {showOutcomes && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Kazanımlar / Neler Katacak?</label>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Virgülle ayırarak yazın</span>
                        </div>
                        <input 
                          type="text" 
                          value={outcomesInput}
                          onChange={(e) => setOutcomesInput(e.target.value)}
                          placeholder="Örn: Sınav netlerinde artış, Hızlı pratik yapabilme"
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-medium shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Örnek İçerik */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Örnek İçerik (Demo)</h4>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-4 cursor-pointer group select-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-4 rounded-2xl transition-all">
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          checked={showDemo}
                          onChange={(e) => setShowDemo(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Örnek İçerik Bölümünü Göster</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Ürün detay sayfasındaki &quot;Örnek İçerik&quot; sekmesi aktif olsun.</span>
                      </div>
                    </label>

                    {showDemo && (
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Örnek İçerik Bağlantısı (PDF / Video URL)</label>
                        <input 
                          type="text" 
                          value={demoUrl}
                          onChange={(e) => setDemoUrl(e.target.value)}
                          placeholder="Örn: /uploads/ornek.pdf veya Youtube video linki"
                          className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Sıkça Sorulan Sorular (SSS) */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Sıkça Sorulan Sorular (SSS)</h4>
                  </div>

                  <div className="space-y-6">
                    <label className="flex items-center gap-4 cursor-pointer group select-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-4 rounded-2xl transition-all">
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          checked={showFaq}
                          onChange={(e) => setShowFaq(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">SSS Bölümünü Göster</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Ürün detay sayfasındaki &quot;SSS&quot; sekmesi aktif olsun.</span>
                      </div>
                    </label>

                    {showFaq && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Sorular & Cevaplar</label>
                          <button
                            type="button"
                            onClick={() => setFaqs([...faqs, { q: '', a: '' }])}
                            className="px-3.5 py-2 text-xs font-black bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Yeni Soru Ekle
                          </button>
                        </div>
                        
                        {faqs.length > 0 ? (
                          <div className="space-y-4">
                            {faqs.map((faq, i) => (
                              <div key={i} className="flex gap-4 items-start bg-slate-50 border border-slate-200/60 p-5 rounded-[1.5rem] relative">
                                <div className="flex-1 space-y-3.5">
                                  <input
                                    type="text"
                                    required
                                    value={faq.q}
                                    onChange={(e) => {
                                      const newFaqs = [...faqs];
                                      newFaqs[i].q = e.target.value;
                                      setFaqs(newFaqs);
                                    }}
                                    placeholder="Soru yazın"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500/40 transition-colors text-xs font-bold"
                                  />
                                  <textarea
                                    rows={2}
                                    required
                                    value={faq.a}
                                    onChange={(e) => {
                                      const newFaqs = [...faqs];
                                      newFaqs[i].a = e.target.value;
                                      setFaqs(newFaqs);
                                    }}
                                    placeholder="Cevap yazın"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500/40 transition-colors text-xs font-medium resize-none"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))}
                                  className="p-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 transition-colors self-center shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold">
                            Henüz özel soru eklenmedi. Boş bırakırsanız varsayılan genel sorular gösterilir.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Eğitmen Bilgileri */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Eğitmen Bilgileri</h4>
                  </div>

                  <div className="space-y-6">
                    <label className="flex items-center gap-4 cursor-pointer group select-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-4 rounded-2xl transition-all">
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          checked={showInstructor}
                          onChange={(e) => setShowInstructor(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Eğitmen Bölümünü Göster</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Ürün detay sayfasındaki &quot;Eğitmen&quot; sekmesi aktif olsun.</span>
                      </div>
                    </label>

                    {showInstructor && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Eğitmen Kadrosu Başlığı / Adı</label>
                            <input 
                              type="text"
                              value={instructorName}
                              onChange={(e) => setInstructorName(e.target.value)}
                              placeholder="Örn: Uzman Eğitmen Kadrosu"
                              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Deneyim / Rol</label>
                            <input 
                              type="text"
                              value={instructorExperience}
                              onChange={(e) => setInstructorExperience(e.target.value)}
                              placeholder="Örn: 10+ Yıl Deneyim"
                              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Eğitmen Açıklaması</label>
                            <textarea 
                              rows={3}
                              value={instructorDescription}
                              onChange={(e) => setInstructorDescription(e.target.value)}
                              placeholder="Eğitmen kadrosu hakkında detaylı bilgi..."
                              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm resize-none shadow-sm font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Avatar İnisiyali</label>
                            <input 
                              type="text"
                              maxLength={2}
                              value={instructorAvatar}
                              onChange={(e) => setInstructorAvatar(e.target.value.toUpperCase())}
                              placeholder="Örn: E"
                              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-semibold shadow-sm text-center"
                            />
                          </div>
                        </div>

                        {/* Instructor Image Upload */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-slate-50/50 border border-slate-200/60 p-4 rounded-3xl">
                          {/* Live Preview Card */}
                          <div className="relative w-20 h-20 shrink-0 bg-slate-100 border border-slate-200 rounded-full overflow-hidden shadow-sm flex items-center justify-center">
                            {instructorImage ? (
                              <img 
                                src={instructorImage} 
                                alt="Eğitmen Önizleme" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-accent-400 to-orange-600 flex items-center justify-center text-2xl text-white font-bold">
                                {instructorAvatar || 'E'}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 w-full space-y-2.5">
                            <div className="flex items-center justify-between pl-1">
                              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Eğitmen Görseli (Dosya Yükle / URL)</label>
                              <span className="text-[10px] text-amber-605 font-bold uppercase tracking-wider">Önerilen: 200x200 px (1:1)</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <input 
                                type="text" 
                                value={instructorImage}
                                onChange={(e) => setInstructorImage(e.target.value)}
                                placeholder="Dosya yolu veya yüklenen görsel linki..."
                                className="flex-1 px-4 py-3 bg-white border border-slate-200 focus:border-amber-500 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-xs font-mono tracking-wide shadow-sm"
                              />
                              <label className="cursor-pointer px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm">
                                {isUploadingInstructor ? (
                                  <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Yükleniyor...
                                  </>
                                ) : (
                                  <>
                                    <PlusCircle className="w-4 h-4" />
                                    Görsel Yükle
                                  </>
                                )}
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleUploadInstructorImage} 
                                  disabled={isUploadingInstructor}
                                  className="hidden" 
                                />
                              </label>
                              {instructorImage && (
                                <button
                                  type="button"
                                  onClick={() => setInstructorImage('')}
                                  className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-2xl text-xs font-bold transition-all"
                                >
                                  Görseli Kaldır
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4 pt-6 border-t border-slate-100 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors text-sm shadow-sm"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3.5 rounded-2xl font-bold bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/15 transition-all text-sm shadow-md shadow-amber-500/10"
                  >
                    {editingId ? 'Değişiklikleri Kaydet' : 'Eğitimi Ekle'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Add Coupon */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-955/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 shrink-0 bg-white">
                <h3 className="text-lg font-black text-slate-900 font-bold">Yeni İndirim Kuponu</h3>
                <button 
                  onClick={() => setIsCouponModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-655 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Content */}
              <form onSubmit={handleCreateCoupon} className="p-6 space-y-5 bg-white">
                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Kupon Kodu</label>
                  <input 
                    type="text" 
                    required
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Örn: YKS2026"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-455 focus:outline-none focus:bg-white focus:border-emerald-500/40 transition-colors text-sm font-mono tracking-wider"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Tipi</label>
                    <select 
                      value={couponType}
                      onChange={(e) => setCouponType(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500/40 transition-colors text-sm font-semibold"
                    >
                      <option value="PERCENTAGE">Yüzdesel (%)</option>
                      <option value="FIXED">Sabit (₺)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Değeri</label>
                    <input 
                      type="number" 
                      required
                      value={couponValue}
                      onChange={(e) => setCouponValue(e.target.value)}
                      placeholder="Örn: 20"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500/40 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Max Kullanım Limiti</label>
                    <input 
                      type="number" 
                      required
                      value={couponMaxUses}
                      onChange={(e) => setCouponMaxUses(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500/40 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Son Kullanma Tarihi</label>
                    <input 
                      type="date" 
                      value={couponExpiryDate}
                      onChange={(e) => setCouponExpiryDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500/40 transition-colors text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Geçerli Olacağı Ürünler (Çoklu Seçilebilir)</label>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={couponProductIds.length === 0}
                        onChange={(e) => {
                          if (e.target.checked) setCouponProductIds([]);
                        }}
                        className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-700">Tüm Ürünlerde Geçerli (Global)</span>
                    </label>
                    <div className="border-t border-slate-200/60 my-2 pt-2">
                      {products.map(p => {
                        const isChecked = couponProductIds.includes(p.id);
                        return (
                          <label key={p.id} className="flex items-center gap-2.5 py-1.5 cursor-pointer select-none hover:bg-slate-100/50 rounded px-1 transition-colors">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCouponProductIds([...couponProductIds, p.id]);
                                } else {
                                  setCouponProductIds(couponProductIds.filter(id => id !== p.id));
                                }
                              }}
                              className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                            />
                            <span className="text-xs font-semibold text-slate-650">{p.title} ({p.price.toLocaleString('tr-TR')} ₺)</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100 bg-white">
                  <button 
                    type="button" 
                    onClick={() => setIsCouponModalOpen(false)}
                    className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-850 hover:bg-slate-100 transition-colors text-sm font-bold rounded-xl"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-bold rounded-xl shadow-md shadow-emerald-500/10"
                  >
                    Kupon Oluştur
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Add / Edit Category */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-955/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 shrink-0 bg-white">
                <h3 className="text-lg font-black text-slate-900 font-bold">
                  {editingCategoryId ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
                </h3>
                <button 
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-655 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Content */}
              <form onSubmit={handleSaveCategory} className="p-6 space-y-5 bg-white">
                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Kategori Adı</label>
                  <input 
                    type="text" 
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Örn: Tarih Paketleri"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500/40 transition-colors text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Açıklama</label>
                  <textarea 
                    rows={3}
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Kategori hakkında kısa açıklama..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500/40 transition-colors text-sm font-semibold resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Sıra (Görüntülenme Sırası)</label>
                  <input 
                    type="number" 
                    required
                    value={categorySortOrder}
                    onChange={(e) => setCategorySortOrder(e.target.value)}
                    placeholder="Örn: 1"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500/40 transition-colors text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">İkon</label>
                    <select 
                      value={categoryIcon}
                      onChange={(e) => setCategoryIcon(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500/40 transition-colors text-sm font-semibold"
                    >
                      <option value="BookOpen">Kitap (BookOpen)</option>
                      <option value="Play">Video (Play)</option>
                      <option value="FileCheck">Sınav (FileCheck)</option>
                      <option value="Package">Kutu (Package)</option>
                      <option value="GraduationCap">Akademi (GraduationCap)</option>
                      <option value="Award">Derece (Award)</option>
                      <option value="Calculator">Matematik (Calculator)</option>
                      <option value="Compass">Sosyal (Compass)</option>
                      <option value="Languages">Sözel/Dil (Languages)</option>
                      <option value="Cpu">Yazılım (Cpu)</option>
                      <option value="Sparkles">Rehberlik (Sparkles)</option>
                      <option value="PenTool">Edebiyat (PenTool)</option>
                      <option value="History">Tarih (History)</option>
                      <option value="FlaskConical">Fen (FlaskConical)</option>
                      <option value="Globe">Coğrafya (Globe)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Renk Grubu</label>
                    <select 
                      value={categoryColor}
                      onChange={(e) => setCategoryColor(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500/40 transition-colors text-sm font-semibold"
                    >
                      <option value="from-blue-500 to-indigo-600">Mavi (Blue)</option>
                      <option value="from-violet-500 to-purple-600">Mor (Purple)</option>
                      <option value="from-emerald-500 to-teal-600">Yeşil (Green)</option>
                      <option value="from-accent-400 to-orange-600">Turuncu (Orange)</option>
                    </select>
                  </div>
                </div>

                {/* Switch: showInNavbar */}
                <label className="flex items-center gap-4 cursor-pointer group select-none bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-4 rounded-2xl transition-all">
                  <div className="relative shrink-0">
                    <input
                      type="checkbox"
                      checked={categoryShowInNavbar}
                      onChange={(e) => setCategoryShowInNavbar(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Üst Menüde Görünsün</span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Bu kategori üst menüdeki "Eğitimler" açılır listesinde gösterilsin.</span>
                  </div>
                </label>

                <div className="flex gap-4 pt-4 border-t border-slate-100 bg-white">
                  <button 
                    type="button" 
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-850 hover:bg-slate-100 transition-colors text-sm font-bold rounded-xl"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-bold rounded-xl shadow-md shadow-emerald-500/10"
                  >
                    {editingCategoryId ? 'Kaydet' : 'Kategori Oluştur'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Add / Edit Testimonial */}
      <AnimatePresence>
        {isTestimonialModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-955/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-white">
                <h3 className="text-lg font-black text-slate-900">
                  {editingTestimonialId ? 'Yorumu Düzenle' : 'Yeni Öğrenci Yorumu'}
                </h3>
                <button 
                  type="button"
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-655 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveTestimonial} className="p-6 space-y-5 bg-white">
                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Öğrenci Adı</label>
                  <input 
                    type="text" 
                    required
                    value={testimonialName}
                    onChange={(e) => setTestimonialName(e.target.value)}
                    placeholder="Örn: Elif Kaya"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Rolü / Sınıfı (Örn: YKS Öğrencisi)</label>
                  <input 
                    type="text" 
                    required
                    value={testimonialRole}
                    onChange={(e) => setTestimonialRole(e.target.value)}
                    placeholder="Örn: AYT Sayısal Birincisi"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Yorumu</label>
                  <textarea 
                    rows={4}
                    required
                    value={testimonialComment}
                    onChange={(e) => setTestimonialComment(e.target.value)}
                    placeholder="Öğrencinin platform hakkındaki geri bildirimi..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Puan</label>
                    <select 
                      value={testimonialRating}
                      onChange={(e) => setTestimonialRating(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                    >
                      <option value="5">5 Yıldız</option>
                      <option value="4">4 Yıldız</option>
                      <option value="3">3 Yıldız</option>
                      <option value="2">2 Yıldız</option>
                      <option value="1">1 Yıldız</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Avatar İnisiyali (Opsiyonel)</label>
                    <input 
                      type="text" 
                      maxLength="2"
                      value={testimonialAvatar.startsWith('/') ? '' : testimonialAvatar}
                      onChange={(e) => setTestimonialAvatar(e.target.value.toUpperCase())}
                      placeholder="Örn: EK"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-450 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-2 pl-1">Öğrenci Fotoğrafı</label>
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {testimonialAvatar && testimonialAvatar.startsWith('/') && (
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0">
                        <img src={testimonialAvatar} alt="Student avatar preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="cursor-pointer px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-sm">
                      {isUploadingAvatar ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          Fotoğraf Yükle
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleUploadSettingImage(e, setTestimonialAvatar, setIsUploadingAvatar)} 
                        disabled={isUploadingAvatar}
                        className="hidden" 
                      />
                    </label>
                    {testimonialAvatar && testimonialAvatar.startsWith('/') && (
                      <button
                        type="button"
                        onClick={() => setTestimonialAvatar('')}
                        className="px-2.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-550 border border-red-100 rounded-xl text-xs font-bold transition-all"
                      >
                        Kaldır
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100 bg-white">
                  <button 
                    type="button" 
                    onClick={() => setIsTestimonialModalOpen(false)}
                    className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-850 hover:bg-slate-100 transition-colors text-sm font-bold rounded-xl"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-amber-500 text-white hover:bg-amber-600 transition-colors text-sm font-bold rounded-xl shadow-md shadow-amber-500/10"
                  >
                    {editingTestimonialId ? 'Kaydet' : 'Yorum Ekle'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Öğrenci Detay Modalı */}
      <AnimatePresence>
        {selectedUser && (() => {
          // Reactivity: update detail data if list changes
          const userDetail = users.find(u => u.id === selectedUser.id) || selectedUser;
          // Filter student orders
          const userOrders = orders.filter(o => o.userId === userDetail.id);
          // Calculate total spending
          const totalSpent = userOrders
            .filter(o => o.paymentStatus === 'SUCCESS')
            .reduce((sum, o) => sum + (o.amount || 0), 0);

          // Handle manual course grant from modal
          const handleModalGrantAccess = async (e) => {
            e.preventDefault();
            if (!modalGrantProductId) {
              setModalError('Lütfen bir eğitim seçin.');
              return;
            }
            setModalIsSubmitting(true);
            setModalError('');
            setModalSuccess('');
            try {
              const selectedProduct = products.find(p => p.id === modalGrantProductId);
              const res = await fetch('/api/admin/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: userDetail.email,
                  productId: modalGrantProductId,
                  amount: modalGrantAmount ? parseFloat(modalGrantAmount) : selectedProduct?.price
                })
              });
              const data = await res.json();
              if (res.ok) {
                setModalSuccess('Eğitim erişimi başarıyla tanımlandı!');
                setModalGrantProductId('');
                setModalGrantAmount('');
                fetchData(); // Refresh global data
              } else {
                setModalError(data.error || 'Erişim tanımlanırken hata oluştu.');
              }
            } catch (err) {
              setModalError('Bağlantı hatası oluştu.');
            } finally {
              setModalIsSubmitting(false);
            }
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row my-8"
              >
                {/* Sol Panel: Profil ve Özet Bilgiler */}
                <div className="md:w-1/3 bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between">
                  <div>
                    {/* Header: Kapat butonu ve profil resmi */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-amber-500/20">
                        {userDetail.name?.substring(0, 2).toUpperCase() || 'ÖG'}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUser(null);
                          setModalError('');
                          setModalSuccess('');
                          setModalGrantProductId('');
                          setModalGrantAmount('');
                        }}
                        className="p-2 bg-white hover:bg-slate-100 border border-slate-200/60 text-slate-400 hover:text-slate-700 rounded-xl transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-xl font-black text-slate-800 mb-1">{userDetail.name || 'Girilmemiş'}</h3>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border tracking-wide uppercase inline-block mb-6 ${
                      userDetail.role === 'ADMIN' 
                        ? 'bg-red-55 text-red-650 border-red-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {userDetail.role === 'ADMIN' ? 'YÖNETİCİ' : 'ÖĞRENCİ'}
                    </span>

                    {/* Bilgiler Listesi */}
                    <div className="space-y-4">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">E-Posta Adresi</span>
                        <span className="text-sm font-semibold text-slate-700 break-all select-all">{userDetail.email}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Telefon Numarası</span>
                        <span className="text-sm font-semibold text-slate-700 select-all">{userDetail.phone || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Konum</span>
                        <span className="text-sm font-semibold text-slate-700">
                          {userDetail.city ? `${userDetail.district ? userDetail.district + ', ' : ''}${userDetail.city}` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kayıt Tarihi</span>
                        <span className="text-sm font-semibold text-slate-700">
                          {new Date(userDetail.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Özet Kartları */}
                  <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-slate-200/60">
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Eğitim Sayısı</span>
                      <span className="text-xl font-black text-slate-800">{userDetail._count?.orders || 0}</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Toplam Harcama</span>
                      <span className="text-xl font-black text-emerald-600">
                        {totalSpent.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sağ Panel: Sipariş Geçmişi & Erişim Ekleme */}
                <div className="flex-1 p-6 flex flex-col justify-between max-h-[85vh] md:max-h-[650px] overflow-y-auto">
                  <div>
                    <h4 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-amber-500" />
                      Satın Aldığı Eğitimler & Sipariş Geçmişi
                    </h4>

                    {userOrders.length > 0 ? (
                      <div className="border border-slate-150 rounded-2xl overflow-hidden mb-6 max-h-[220px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 text-[10px] uppercase">
                              <th className="py-2.5 px-4">Sipariş ID</th>
                              <th className="py-2.5 px-4">Eğitim</th>
                              <th className="py-2.5 px-4">Tutar</th>
                              <th className="py-2.5 px-4">Tarih</th>
                              <th className="py-2.5 px-4 text-right">Durum</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userOrders.map((order) => (
                              <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td className="py-2.5 px-4 font-mono font-medium text-slate-400 select-all">#{order.id.slice(-6).toUpperCase()}</td>
                                <td className="py-2.5 px-4 font-bold text-slate-700">{order.product?.title || 'Bilinmeyen Ürün'}</td>
                                <td className="py-2.5 px-4 font-semibold text-slate-600">
                                  {order.amount ? order.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-'}
                                </td>
                                <td className="py-2.5 px-4 text-slate-500">
                                  {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="py-2.5 px-4 text-right">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                    order.paymentStatus === 'SUCCESS' 
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                      : order.paymentStatus === 'WAITING' 
                                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                                      : 'bg-red-50 text-red-650 border-red-100'
                                  }`}>
                                    {order.paymentStatus === 'SUCCESS' ? 'BAŞARILI' : order.paymentStatus === 'WAITING' ? 'BEKLEMEDE' : 'İPTAL'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 font-medium mb-6">
                        Bu öğrenciye ait herhangi bir eğitim siparişi bulunmuyor.
                      </div>
                    )}
                  </div>

                  {/* Manuel Eğitim Erişim Formu */}
                  <div className="border-t border-slate-155 pt-6 mt-auto">
                    <h5 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-1.5">
                      <PlusCircle className="w-4.5 h-4.5 text-amber-500" />
                      Manuel Eğitim / Erişim Tanımla
                    </h5>

                    {modalError && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-650 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{modalError}</span>
                      </div>
                    )}

                    {modalSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-650 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4 animate-fade-in">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{modalSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleModalGrantAccess} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">Eğitim Paketi</label>
                          <select
                            value={modalGrantProductId}
                            onChange={(e) => setModalGrantProductId(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-xs font-bold"
                          >
                            <option value="">Eğitim seçin...</option>
                            {products
                              .filter(p => !userOrders.some(o => o.productId === p.id && o.paymentStatus === 'SUCCESS'))
                              .map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.title} ({p.price?.toLocaleString('tr-TR')} TL)
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5">İndirimli Tutar (Boş ise tam fiyat)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Örn: 2500"
                            value={modalGrantAmount}
                            onChange={(e) => setModalGrantAmount(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-xs font-bold"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={modalIsSubmitting}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5"
                      >
                        {modalIsSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            İşlem Yapılıyor...
                          </>
                        ) : (
                          <>
                            <Key className="w-4 h-4" />
                            Eğitim Tanımla / Yetkilendir
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Modal - Add User */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-955/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 shrink-0 bg-white">
                <h3 className="text-lg font-black text-slate-900 font-bold">Yeni Öğrenci Kaydet</h3>
                <button 
                  onClick={() => setIsUserModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-655 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Content */}
              <form onSubmit={handleUserSubmit} className="p-6 space-y-4 bg-white overflow-y-auto max-h-[80vh]">
                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1.5 pl-1">Ad Soyad</label>
                  <input 
                    type="text" 
                    required
                    value={userFormName}
                    onChange={(e) => setUserFormName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1.5 pl-1">E-Posta Adresi</label>
                  <input 
                    type="email" 
                    required
                    value={userFormEmail}
                    onChange={(e) => setUserFormEmail(e.target.value)}
                    placeholder="Örn: ahmet@gmail.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1.5 pl-1">Şifre</label>
                  <input 
                    type="password" 
                    required
                    value={userFormPassword}
                    onChange={(e) => setUserFormPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1.5 pl-1">Telefon Numarası</label>
                  <input 
                    type="tel" 
                    required
                    value={userFormPhone}
                    onChange={(e) => setUserFormPhone(e.target.value)}
                    placeholder="Örn: 05551234567"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1.5 pl-1">İl</label>
                    <select
                      required
                      value={userFormCity}
                      onChange={(e) => {
                        setUserFormCity(e.target.value);
                        setUserFormDistrict('');
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold cursor-pointer"
                    >
                      <option value="">İl Seçin</option>
                      {Object.keys(turkeyCities).sort((a, b) => a.localeCompare(b, 'tr')).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1.5 pl-1">İlçe</label>
                    <select
                      required
                      disabled={!userFormCity}
                      value={userFormDistrict}
                      onChange={(e) => setUserFormDistrict(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold cursor-pointer disabled:opacity-50"
                    >
                      <option value="">İlçe Seçin</option>
                      {userFormCity && turkeyCities[userFormCity].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1.5 pl-1">Rol / Yetki</label>
                  <select 
                    value={userFormRole}
                    onChange={(e) => setUserFormRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500/40 transition-colors text-sm font-semibold"
                  >
                    <option value="STUDENT">Öğrenci</option>
                    <option value="ADMIN">Yönetici (Admin)</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit"
                    disabled={isUserSubmitting}
                    className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5"
                  >
                    {isUserSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl p-6 flex flex-col items-center text-center space-y-4"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${confirmDialog.type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                <AlertCircle className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 font-sans">
                  {confirmDialog.title}
                </h3>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed max-w-sm">
                  {confirmDialog.message}
                </p>
              </div>

              <div className="flex w-full gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmClose(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmClose(true)}
                  className={`flex-1 py-3 text-white rounded-2xl text-xs font-bold transition-all shadow-md ${
                    confirmDialog.type === 'danger'
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10'
                      : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10'
                  }`}
                >
                  Onayla
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
