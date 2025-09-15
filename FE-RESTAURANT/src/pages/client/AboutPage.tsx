import React from "react";
import "../../style/client/AboutClient.scss"


const AboutPage = () => {
  return (
    <div className="w-full bg-background-cream pt-32 pb-16">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl text-primary-warm mb-4">Về GOLDENBAMBOO</h1>
          <p className="text-gray text-lg leading-relaxed max-w-2xl mx-auto">
            GOLDENBAMBOO mang đến trải nghiệm ẩm thực Việt Nam đích thực, kết hợp công thức truyền thống với nguyên liệu tươi ngon nhất.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl text-primary-warm mb-6">
              Đầu Bếp Của Chúng Tôi
            </h2>
            <p className="text-gray mb-6 leading-relaxed">
              Đầu bếp Minh Nguyễn mang đến hơn 20 năm kinh nghiệm ẩm thực cho GOLDENBAMBOO. Sinh ra và lớn lên tại Hà Nội, Chef Minh học nghệ thuật nấu ăn Việt Nam từ bà của mình, người đã truyền lại những công thức gia truyền qua nhiều thế hệ.
            </p>
            <p className="text-gray mb-6 leading-relaxed">
              Sau khi được đào tạo tại Trung tâm Ẩm thực Quốc tế tại New York, Chef Minh đã làm việc tại nhiều nhà hàng nổi tiếng trước khi mở GOLDENBAMBOO vào năm 2005. Triết lý của anh rất đơn giản: tôn trọng kỹ thuật truyền thống đồng thời sử dụng các nguyên liệu địa phương tươi ngon nhất.
            </p>
            <p className="text-gray leading-relaxed">
              "Ẩm thực Việt Nam là sự cân bằng hoàn hảo," Chef Minh nói. "Sự hài hòa giữa hương vị, kết cấu và màu sắc tạo nên một trải nghiệm ẩm thực khó quên."
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1977&q=80"
              alt="Đầu bếp chuẩn bị món ăn Việt Nam"
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 md:w-32 md:h-32 bg-secondary-warm rounded-lg z-[-1]"></div>
          </div>
        </div>
        <div className="mt-20">
          <h2 className="font-serif text-3xl text-primary-warm mb-8 text-center">
            Giá Trị Của Chúng Tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="font-serif text-xl text-primary-warm mb-4">
                Tính Chính Thống
              </h3>
              <p className="text-gray">
                Chúng tôi luôn giữ đúng các phương pháp nấu ăn truyền thống Việt Nam và các hương vị đặc trưng, sử dụng công thức được truyền qua nhiều thế hệ.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="font-serif text-xl text-primary-warm mb-4">
                Chất Lượng
              </h3>
              <p className="text-gray">
                Chúng tôi sử dụng các nguyên liệu tươi ngon nhất từ các trang trại và chợ địa phương, kết hợp với các loại gia vị và thảo mộc Việt Nam chính gốc.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="font-serif text-xl text-primary-warm mb-4">
                Cộng Đồng
              </h3>
              <p className="text-gray">
                Chúng tôi tin tưởng vào việc tạo ra một không gian ấm cúng, thân thiện, nơi bạn bè và gia đình có thể tụ họp để chia sẻ bữa ăn và tạo nên những kỷ niệm.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;